import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../constants.js';
import { HealingAndStatusOption, PtuRandomSubcommand } from '../../subcommand-groups/random.js';
import { RandomResult } from '../../types/PtuRandom.js';
import { BaseRandomStrategy } from './BaseRandomStrategy.js';
import { PtuRandomPickupSubcommandResponse, PtuRandomPickupSubcommandStrategy } from './types.js';

enum HealingItemTypes
{
    Healing = 'Healing',
    Status = 'Status',
}

interface ShouldIncludeParameters
{
    inputType: string;
    type: string;
}

@staticImplements<PtuRandomPickupSubcommandStrategy>()
export class RandomHealingItemStrategy
{
    public static key: PtuRandomSubcommand.HealingItem = PtuRandomSubcommand.HealingItem;

    public static async run(
        interaction: ChatInputCommandInteraction,
        shouldReturnMessageOptions = false,
    ): Promise<boolean | PtuRandomPickupSubcommandResponse>
    {
        // Get parameter results
        const inputType = interaction.options.getString('type') || HealingAndStatusOption.HealingAndStatus;

        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessPtuSpreadsheetId,
            range: `'${BaseRandomStrategy.subcommandToStrings[this.key].data} Data'!A2:D`,
        });

        // Parse the data
        const parsedData = data.reduce<RandomResult[]>((acc, [name, cost, type, description]) =>
        {
            if (this.shouldInclude({ inputType, type }))
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
        }, undefined, shouldReturnMessageOptions);
    }

    private static shouldInclude({ inputType, type }: ShouldIncludeParameters): boolean
    {
        /* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */ // This comes as a string from a spreadsheet - just compare the string values.
        return (
            inputType === HealingAndStatusOption.HealingAndStatus
            || (inputType === HealingAndStatusOption.Healing && type === HealingItemTypes.Healing)
            || (inputType === HealingAndStatusOption.Status && type === HealingItemTypes.Status)
        );
        /* eslint-enable @typescript-eslint/no-unsafe-enum-comparison */
    }
}
