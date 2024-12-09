import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { getQrDamageChartsEmbedMessages } from '../../embed-messages/quickReference.js';
import { PtuQuickReferenceInfo } from '../../options/index.js';
import { PtuDamageChartService } from '../../services/PtuDamageChartService.js';

@staticImplements<ChatIteractionStrategy>()
export class QrDamageChartsStrategy
{
    public static key: PtuQuickReferenceInfo.DamageCharts = PtuQuickReferenceInfo.DamageCharts;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Parse the damage charts into columns of table data
        const columnData = PtuDamageChartService.charts.reduce<{
            dbColumn: string[];
            dicepoolColumn: string[];
            minDamageColumn: string[];
            averageDamageColumn: string[];
            maxDamageColumn: string[];
        }>((acc, cur) =>
        {
            const {
                damageBase,
                dicepool,
                min,
                average,
                max,
            } = cur;

            acc.dbColumn.push(damageBase.toString());
            acc.dicepoolColumn.push(dicepool);
            acc.minDamageColumn.push(min.toString());
            acc.averageDamageColumn.push(average.toString());
            acc.maxDamageColumn.push(max.toString());

            return acc;
        }, {
            // Initialize the column headers
            dbColumn: ['DB'],
            dicepoolColumn: ['Dicepool'],
            minDamageColumn: ['Min'],
            averageDamageColumn: ['Average'],
            maxDamageColumn: ['Max'],
        });

        // Parse the table data into embed messages
        const embeds = getQrDamageChartsEmbedMessages(
            Object.values(columnData),
        );

        // Send the embed messages
        await interaction.editReply({
            embeds,
        });

        return true;
    }
}
