export type PtuDicepoolString = `${number}d${number}${`+${number}` | `-${number}` | ''}`;

export interface DamageChart
{
    damageBase: number;
    dicepool: PtuDicepoolString;
    min: number;
    average: number;
    max: number;
}

export class PtuDamageChartService
{
    private static damageCharts: DamageChart[] = [
        {
            damageBase: 1,
            dicepool: '1d6+1',
            min: 2,
            average: 5,
            max: 7,
        },
        {
            damageBase: 2,
            dicepool: '1d6+3',
            min: 4,
            average: 7,
            max: 9,
        },
        {
            damageBase: 3,
            dicepool: '1d6+5',
            min: 6,
            average: 9,
            max: 11,
        },
        {
            damageBase: 4,
            dicepool: '1d8+6',
            min: 7,
            average: 11,
            max: 14,
        },
        {
            damageBase: 5,
            dicepool: '1d8+8',
            min: 9,
            average: 13,
            max: 16,
        },
        {
            damageBase: 6,
            dicepool: '2d6+8',
            min: 10,
            average: 15,
            max: 20,
        },
        {
            damageBase: 7,
            dicepool: '2d6+10',
            min: 12,
            average: 17,
            max: 22,
        },
        {
            damageBase: 8,
            dicepool: '2d8+10',
            min: 12,
            average: 19,
            max: 26,
        },
        {
            damageBase: 9,
            dicepool: '2d10+10',
            min: 12,
            average: 21,
            max: 30,
        },
        {
            damageBase: 10,
            dicepool: '3d8+10',
            min: 13,
            average: 24,
            max: 34,
        },
        {
            damageBase: 11,
            dicepool: '3d10+10',
            min: 13,
            average: 27,
            max: 40,
        },
        {
            damageBase: 12,
            dicepool: '3d12+10',
            min: 13,
            average: 30,
            max: 46,
        },
        {
            damageBase: 13,
            dicepool: '4d10+10',
            min: 14,
            average: 35,
            max: 50,
        },
        {
            damageBase: 14,
            dicepool: '4d10+15',
            min: 19,
            average: 40,
            max: 55,
        },
        {
            damageBase: 15,
            dicepool: '4d10+20',
            min: 24,
            average: 45,
            max: 60,
        },
        {
            damageBase: 16,
            dicepool: '5d10+20',
            min: 25,
            average: 50,
            max: 70,
        },
        {
            damageBase: 17,
            dicepool: '5d12+25',
            min: 30,
            average: 60,
            max: 85,
        },
        {
            damageBase: 18,
            dicepool: '6d12+25',
            min: 31,
            average: 65,
            max: 97,
        },
        {
            damageBase: 19,
            dicepool: '6d12+30',
            min: 36,
            average: 70,
            max: 102,
        },
        {
            damageBase: 20,
            dicepool: '6d12+35',
            min: 41,
            average: 75,
            max: 107,
        },
        {
            damageBase: 21,
            dicepool: '6d12+40',
            min: 46,
            average: 80,
            max: 112,
        },
        {
            damageBase: 22,
            dicepool: '6d12+45',
            min: 51,
            average: 85,
            max: 117,
        },
        {
            damageBase: 23,
            dicepool: '6d12+50',
            min: 56,
            average: 90,
            max: 122,
        },
        {
            damageBase: 24,
            dicepool: '6d12+55',
            min: 61,
            average: 95,
            max: 127,
        },
        {
            damageBase: 25,
            dicepool: '6d12+60',
            min: 66,
            average: 100,
            max: 132,
        },
        {
            damageBase: 26,
            dicepool: '7d12+65',
            min: 72,
            average: 110,
            max: 149,
        },
        {
            damageBase: 27,
            dicepool: '8d12+70',
            min: 78,
            average: 120,
            max: 166,
        },
        {
            damageBase: 28,
            dicepool: '8d12+80',
            min: 88,
            average: 130,
            max: 176,
        },
    ];

    private static damageBaseToDamageChart: Record<number, DamageChart> = this.damageCharts.reduce<Record<number, DamageChart>>(
        (acc, chart) =>
        {
            const { damageBase } = chart;
            acc[damageBase] = chart;

            return acc;
        },
        {},
    );

    static get charts(): DamageChart[]
    {
        return this.damageCharts;
    }

    public static getDamageChartByDamageBase(damageBase: number): DamageChart
    {
        return this.damageBaseToDamageChart[damageBase];
    }
}
