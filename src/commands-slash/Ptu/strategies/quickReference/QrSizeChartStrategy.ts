import { Text } from '@beanc16/discordjs-helpers';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { PtuQuickReferenceInfo } from '../../options/index.js';
import type { PtuChatIteractionStrategy } from '../../types/strategies.js';

interface HeightChart
{
    name: string;
    size: number;
    min: {
        imperial: string;
        metric: string;
    };
    max?: {
        imperial: string;
        metric: string;
    };
}

interface WeightChart
{
    class: number;
    min: {
        imperial: string;
        metric: string;
    };
    max?: {
        imperial: string;
        metric: string;
    };
    addendum?: string;
}

@staticImplements<PtuChatIteractionStrategy>()
export class QrSizeChartChartStrategy
{
    public static key: PtuQuickReferenceInfo.SizeChart = PtuQuickReferenceInfo.SizeChart;

    private static heightCharts: HeightChart[] = [
        {
            name: 'Small',
            size: 1,
            min: {
                imperial: `0'1"`,
                metric: '2.5cm',
            },
            max: {
                imperial: `3'2"`,
                metric: '1m',
            },
        },
        {
            name: 'Medium',
            size: 1,
            min: {
                imperial: `3'3"`,
                metric: '1m',
            },
            max: {
                imperial: `5'11"`,
                metric: '1.5m',
            },
        },
        {
            name: 'Large',
            size: 2,
            min: {
                imperial: `6'0"`,
                metric: '1.5m',
            },
            max: {
                imperial: `8'11"`,
                metric: '2.7m',
            },
        },
        {
            name: 'Huge',
            size: 3,
            min: {
                imperial: `9'0"`,
                metric: '2.7m',
            },
            max: {
                imperial: `13'11"`,
                metric: '4.2m',
            },
        },
        {
            name: 'Gigantic',
            size: 4,
            min: {
                imperial: `14'0"+`,
                metric: '4.3m+',
            },
        },
    ];

    private static weightCharts: WeightChart[] = [
        {
            class: 1,
            min: {
                imperial: '0lbs',
                metric: '0kgs',
            },
            max: {
                imperial: '25lbs',
                metric: '11kgs',
            },
        },
        {
            class: 2,
            min: {
                imperial: '25lbs',
                metric: '11kgs',
            },
            max: {
                imperial: '55lbs',
                metric: '25kgs',
            },
        },
        {
            class: 3,
            min: {
                imperial: '55lbs',
                metric: '25kgs',
            },
            max: {
                imperial: '110lbs',
                metric: '50kgs',
            },
        },
        {
            class: 4,
            min: {
                imperial: '110lbs',
                metric: '50kgs',
            },
            max: {
                imperial: '220lbs',
                metric: '100kgs',
            },
        },
        {
            class: 5,
            min: {
                imperial: '220lbs',
                metric: '100kgs',
            },
            max: {
                imperial: '440lbs',
                metric: '200kgs',
            },
        },
        {
            class: 6,
            min: {
                imperial: '440lbs+',
                metric: '200kgs+',
            },
        },
        {
            class: 7,
            min: {
                imperial: '450lbs+',
                metric: '204kgs+',
            },
            addendum: 'with the Heavy Metal Ability',
        },
    ];

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Parse the data into embed messages
        const embeds = this.getEmbeds();

        // Send the embed messages
        await interaction.editReply({ embeds });

        return true;
    }

    private static getEmbeds(): EmbedBuilder[]
    {
        const color = 0xCDCDCD;

        const heightDescription = this.heightCharts.reduce((acc, {
            name,
            size,
            min,
            max,
        }) =>
        {
            return acc + `${Text.bold(name)}: ${this.getRange({ min, max })} [${size}x${size}]\n`;
        }, '');

        const weightDescription = this.weightCharts.reduce((acc, chart) =>
        {
            return acc + `${Text.bold(`Weight Class ${chart.class}`)}: ${this.getRange(chart)}\n`;
        }, '');

        const heightEmbed = new EmbedBuilder({
            title: 'Height Chart',
            description: heightDescription,
            color,
        });

        const weightEmbed = new EmbedBuilder({
            title: 'Weight Chart',
            description: weightDescription,
            color,
        });

        return [heightEmbed, weightEmbed];
    }

    private static getRange({
        min,
        max,
        addendum,
    }: Pick<WeightChart, 'min' | 'max' | 'addendum'>): string
    {
        const maxImperial = max?.imperial
            ? ` - ${max.imperial}`
            : '';

        const maxMetric = max?.metric
            ? ` - ${max.metric}`
            : '';

        const addendumStr = addendum
            ? ` ${addendum}`
            : '';

        return `${min.imperial}${maxImperial} (${min.metric}${maxMetric})${addendumStr}`;
    }
}
