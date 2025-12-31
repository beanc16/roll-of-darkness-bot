import { logger } from '@beanc16/logger';
import { FakemonStatsEditStringSelectElementOptions } from '../../components/fakemon/actionRowBuilders/stats/FakemonStatsEditStringSelectActionRowBuilder.js';
import { PtuFakemonCollection } from '../../dal/models/PtuFakemonCollection.js';
import { PtuFakemonPseudoCache } from '../../dal/PtuFakemonPseudoCache.js';
import { FakemonCapabilityManagerService } from './FakemonCapabilityManagerService.js';

export class FakemonStatManagerService
{
    public static getStatKey(statToEdit: FakemonStatsEditStringSelectElementOptions): keyof PtuFakemonCollection['baseStats']
    {
        switch (statToEdit)
        {
            case FakemonStatsEditStringSelectElementOptions.HP:
                return 'hp';
            case FakemonStatsEditStringSelectElementOptions.Attack:
                return 'attack';
            case FakemonStatsEditStringSelectElementOptions.Defense:
                return 'defense';
            case FakemonStatsEditStringSelectElementOptions.SpecialAttack:
                return 'specialAttack';
            case FakemonStatsEditStringSelectElementOptions.SpecialDefense:
                return 'specialDefense';
            case FakemonStatsEditStringSelectElementOptions.Speed:
                return 'speed';
            default:
                const typeCheck: never = statToEdit;
                throw new Error(`Unhandled statToEdit: ${typeCheck}`);
        }
    }

    public static async setStat({
        messageId,
        fakemon,
        statToEdit,
        stat,
    }: {
        messageId: string;
        fakemon: PtuFakemonCollection;
        statToEdit: FakemonStatsEditStringSelectElementOptions;
        stat: number;
    }): Promise<PtuFakemonCollection>
    {
        if (stat < 0)
        {
            throw new Error('Stat cannot be negative');
        }

        // Update fakemon
        const statKey = FakemonStatManagerService.getStatKey(statToEdit);
        const updatedFakemon = await PtuFakemonPseudoCache.update(messageId, { id: fakemon.id }, {
            baseStats: {
                ...fakemon.baseStats,
                [statKey]: stat,
            },
        });

        // Add/Remove underdog capability based on BST
        const bst = FakemonStatManagerService.getBst(updatedFakemon);

        // Add underdog if BST is less than or equal to 45 and
        // the fakemon doesn't already have the underdog capability
        if (
            bst <= 45
            && !updatedFakemon.capabilities.other?.some(element =>
                element.trim().toLowerCase() === 'underdog'
            )
        )
        {
            try
            {
                return await FakemonCapabilityManagerService.addOtherCapabilities({
                    messageId,
                    fakemon: updatedFakemon,
                    other: ['Underdog'],
                });
            }
            catch (error)
            {
                logger.warn('Successfully updated stats, but failed to add underdog capability', error);
                throw new Error('Successfully updated stats, but failed to add underdog capability');
            }
        }

        // Remove underdog if BST is greater than 45 and
        // the fakemon has the underdog capability
        else if (
            bst > 45
            && updatedFakemon.capabilities.other?.some(element =>
                element.trim().toLowerCase() === 'underdog'
            )
        )
        {
            try
            {
                return await FakemonCapabilityManagerService.removeOtherCapabilities({
                    messageId,
                    fakemon: updatedFakemon,
                    other: ['Underdog'],
                });
            }
            catch (error)
            {
                logger.warn('Successfully updated stats, but failed to remove Underdog capability', error);
                throw new Error('Successfully updated stats, but failed to remove Underdog capability');
            }
        }

        return updatedFakemon;
    }

    public static async swapStats({
        messageId,
        fakemon,
        statsToSwap,
    }: {
        messageId: string;
        fakemon: PtuFakemonCollection;
        statsToSwap: [FakemonStatsEditStringSelectElementOptions, FakemonStatsEditStringSelectElementOptions];
    }): Promise<PtuFakemonCollection>
    {
        if (statsToSwap.length !== 2)
        {
            throw new Error('Exactly 2 stats must be swapped');
        }

        const [statsToSwapKey1, statsToSwapKey2] = statsToSwap.map(statToEdit =>
            FakemonStatManagerService.getStatKey(statToEdit),
        );
        const stat1 = fakemon.baseStats[statsToSwapKey1];
        const stat2 = fakemon.baseStats[statsToSwapKey2];

        return await PtuFakemonPseudoCache.update(messageId, { id: fakemon.id }, {
            baseStats: {
                ...fakemon.baseStats,
                [statsToSwapKey1]: stat2,
                [statsToSwapKey2]: stat1,
            },
        });
    }

    private static getBst({ baseStats }: Pick<PtuFakemonCollection, 'baseStats'>): number
    {
        return Object.values(baseStats).reduce((acc, val) => acc + val, 0);
    }
}
