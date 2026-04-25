import { Text } from '@beanc16/discordjs-helpers';

import { FakemonEmbedMessage } from './FakemonEmbedMessage.js';

export type LevelUpMoveDistributionCategory = {
    moveName: string;
    basedOnMove?: string;
    level: number;
    averageLevel: number;
    basedOnAverageLevel?: number;
}[];

export interface LevelUpMoveDistribution
{
    lessThanOrEqual16: LevelUpMoveDistributionCategory;
    lessThanOrEqual11: LevelUpMoveDistributionCategory;
    lessThanOrEqual6: LevelUpMoveDistributionCategory;
    avg: LevelUpMoveDistributionCategory;
    greaterThanOrEqual6: LevelUpMoveDistributionCategory;
    greaterThanOrEqual11: LevelUpMoveDistributionCategory;
    greaterThanOrEqual16: LevelUpMoveDistributionCategory;
    outliers: LevelUpMoveDistributionCategory;
    avgDeviation: number;
    avgDeviationBasedOn: number;
}

const LABEL: Record<Exclude<keyof LevelUpMoveDistribution, 'avgDeviation' | 'avgDeviationBasedOn'>, string> = {
    lessThanOrEqual16: '≤ lvl -16',
    lessThanOrEqual11: 'lvl -15-(-11)',
    lessThanOrEqual6: 'lvl -10-(-6)',
    avg: 'lvl -5-5 (avg)',
    greaterThanOrEqual6: 'lvl 6-10',
    greaterThanOrEqual11: 'lvl 11-15',
    greaterThanOrEqual16: 'lvl 16+',
    outliers: 'Unknown Avg Level',
};

function formatCategory(category: LevelUpMoveDistributionCategory): string[]
{
    return category.map(({
        moveName,
        basedOnMove,
        level,
        averageLevel,
        basedOnAverageLevel,
    }) =>
    {
        const hasBasedOn = basedOnMove !== undefined;
        const basedOnStr = hasBasedOn
            ? ` ${Text.bold('|')} based on ${Text.bold(basedOnMove)} - avg ${basedOnAverageLevel !== undefined && basedOnAverageLevel > 0 ? basedOnAverageLevel : '-'}`
            : '';

        return `${Text.bold(moveName)} - lvl ${level}, avg ${averageLevel > 0 ? averageLevel : '-'}${basedOnStr}`;
    });
}

export class FakemonLevelUpMoveDistributionEmbedMessage extends FakemonEmbedMessage
{
    constructor(distribution: LevelUpMoveDistribution)
    {
        const avgDeviationSign = distribution.avgDeviation > 0 ? '+' : '';
        const avgDeviationBasedOnSign = distribution.avgDeviationBasedOn > 0 ? '+' : '';

        super({
            title: 'Level Up Move Distribution',
            descriptionLines: [
                '### Average Deviations',
                `Avg Deviation: ${avgDeviationSign}${distribution.avgDeviation.toFixed(1)}`,
                `Avg Deviation (based on): ${avgDeviationBasedOnSign}${distribution.avgDeviationBasedOn.toFixed(1)}`,
                '### Distribution',
                ...(distribution.lessThanOrEqual16.length > 0
                    ? [
                        `🤔 ${Text.underline(`${LABEL.lessThanOrEqual16}: ${distribution.lessThanOrEqual16.length} moves`)}`,
                        ...formatCategory(distribution.lessThanOrEqual16),
                        '----------',
                    ]
                    : []
                ),
                ...(distribution.lessThanOrEqual11.length > 0
                    ? [
                        `👀 ${Text.underline(`${LABEL.lessThanOrEqual11}: ${distribution.lessThanOrEqual11.length} moves`)}`,
                        ...formatCategory(distribution.lessThanOrEqual11),
                        '----------',
                    ]
                    : []
                ),
                ...(distribution.lessThanOrEqual6.length > 0
                    ? [
                        `👁️ ${Text.underline(`${LABEL.lessThanOrEqual6}: ${distribution.lessThanOrEqual6.length} moves`)}`,
                        ...formatCategory(distribution.lessThanOrEqual6),
                        '----------',
                    ]
                    : []
                ),
                ...(distribution.greaterThanOrEqual6.length > 0
                    ? [
                        `👁️ ${Text.underline(`${LABEL.greaterThanOrEqual6}: ${distribution.greaterThanOrEqual6.length} moves`)}`,
                        ...formatCategory(distribution.greaterThanOrEqual6),
                        '----------',
                    ]
                    : []
                ),
                ...(distribution.greaterThanOrEqual11.length > 0
                    ? [
                        `👀 ${Text.underline(`${LABEL.greaterThanOrEqual11}: ${distribution.greaterThanOrEqual11.length} moves`)}`,
                        ...formatCategory(distribution.greaterThanOrEqual11),
                        '----------',
                    ]
                    : []
                ),
                ...(distribution.greaterThanOrEqual16.length > 0
                    ? [
                        `🤔 ${Text.underline(`${LABEL.greaterThanOrEqual16}: ${distribution.greaterThanOrEqual16.length} moves`)}`,
                        ...formatCategory(distribution.greaterThanOrEqual16),
                        '----------',
                    ]
                    : []
                ),
                ...(distribution.avg.length > 0
                    ? [
                        `👍 ${Text.underline(`${LABEL.avg}: ${distribution.avg.length} moves`)}`,
                        ...formatCategory(distribution.avg),
                        '----------',
                    ]
                    : []
                ),
                ...(distribution.outliers.length > 0
                    ? [
                        `❓ ${Text.underline(LABEL.outliers)}`,
                        ...formatCategory(distribution.outliers),
                    ]
                    : []
                ),
            ],
        });

        this.setFooter({
            text: '+ = above average, - = below average',
        });
    }
}
