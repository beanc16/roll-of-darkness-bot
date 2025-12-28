import { FakemonStatsStringSelectElementOptions } from '../../components/fakemon/actionRowBuilders/stats/FakemonStatsStringSelectActionRowBuilder.js';
import { PtuFakemonCollection } from '../../dal/models/PtuFakemonCollection.js';
import { PtuFakemonPseudoCache } from '../../dal/PtuFakemonPseudoCache.js';

export class FakemonStatManagerService
{
    public static getStatKey(statToEdit: FakemonStatsStringSelectElementOptions): keyof PtuFakemonCollection['baseStats']
    {
        switch (statToEdit)
        {
            case FakemonStatsStringSelectElementOptions.HP:
                return 'hp';
            case FakemonStatsStringSelectElementOptions.Attack:
                return 'attack';
            case FakemonStatsStringSelectElementOptions.Defense:
                return 'defense';
            case FakemonStatsStringSelectElementOptions.SpecialAttack:
                return 'specialAttack';
            case FakemonStatsStringSelectElementOptions.SpecialDefense:
                return 'specialDefense';
            case FakemonStatsStringSelectElementOptions.Speed:
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
        statToEdit: FakemonStatsStringSelectElementOptions;
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
        statsToSwap: [FakemonStatsStringSelectElementOptions, FakemonStatsStringSelectElementOptions];
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
