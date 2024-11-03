import { ChatInputCommandInteraction } from 'discord.js';

import { ChatIteractionStrategy } from '../../../strategies/ChatIteractionStrategy.js';
import { staticImplements } from '../../../../decorators/staticImplements.js';
import { HealingAndStatusOption, PtuRandomSubcommand } from '../../subcommand-groups/random.js';
import { BaseRandomStrategy } from './BaseRandomStrategy.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService.js';
import { RandomResult } from '../../../Ptu.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../constants.js';

enum HealingItemTypes
{
    Healing = 'Healing',
    Status = 'Status',
}

@staticImplements<ChatIteractionStrategy>()
export class RandomHealingItemStrategy
{
    public static key = PtuRandomSubcommand.HealingItem;

    static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const inputType = interaction.options.getString('type') || HealingAndStatusOption.HealingAndStatus;

        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessPtuSpreadsheetId,
            range: `'${BaseRandomStrategy.subcommandToStrings[this.key].data} Data'!A2:D`,
        });

        const shouldInclude = ({ inputType, type }: { inputType: string, type: string }) =>
        {
            return (
                inputType === HealingAndStatusOption.HealingAndStatus
                || (inputType === HealingAndStatusOption.Healing && type === HealingItemTypes.Healing)
                || (inputType === HealingAndStatusOption.Status && type === HealingItemTypes.Status)
            );
        };

        // Parse the data
        const parsedData = data.reduce<RandomResult[]>((acc, [name, cost, type, description]) => {
            if (shouldInclude({ inputType, type }))
            {
                acc.push({
                    name,
                    cost,
                    description,
                });
            }

            return acc;
        }, []);

        return await BaseRandomStrategy.run(interaction, this.key, {
            commandName: `ptu random ${this.key}`,
            parsedData,
        });
    }
}
