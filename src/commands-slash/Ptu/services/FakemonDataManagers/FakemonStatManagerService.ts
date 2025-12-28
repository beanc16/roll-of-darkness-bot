import { FakemonStatsEditStringSelectElementOptions } from '../../components/fakemon/actionRowBuilders/stats/FakemonStatsEditStringSelectActionRowBuilder.js';
import { PtuFakemonCollection } from '../../dal/models/PtuFakemonCollection.js';
import { PtuFakemonPseudoCache } from '../../dal/PtuFakemonPseudoCache.js';

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
        const statKey = FakemonStatManagerService.getStatKey(statToEdit);
        return await PtuFakemonPseudoCache.update(messageId, { id: fakemon.id }, {
            baseStats: {
                ...fakemon.baseStats,
                [statKey]: stat,
            },
        });
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
}
