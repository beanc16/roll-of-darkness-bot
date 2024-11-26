import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../constants.js';
import { PtuRandomSubcommand } from '../../subcommand-groups/random.js';
import { RandomResult } from '../../types/PtuRandom.js';
import { BaseRandomStrategy } from './BaseRandomStrategy.js';
import { PtuRandomPickupSubcommandResponse, PtuRandomPickupSubcommandStrategy } from './types.js';

enum HeldItemTypes
{
    Normal = 'Normal',
    Mega = 'Mega',
    Badge = 'Badge',
}

interface ShouldIncludeParameters
{
    type: string;
    includeMega: boolean;
    includeBadges: boolean;
}

@staticImplements<PtuRandomPickupSubcommandStrategy>()
export class RandomHeldItemStrategy
{
    public static key: PtuRandomSubcommand.HeldItem = PtuRandomSubcommand.HeldItem;

    public static async run(
        interaction: ChatInputCommandInteraction,
        shouldReturnMessageOptions = false,
    ): Promise<boolean | PtuRandomPickupSubcommandResponse>
    {
        // Get parameter results
        const includeMega = interaction.options.getBoolean('include_mega') || false;
        const includeBadges = interaction.options.getBoolean('include_badges') || false;

        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessPtuSpreadsheetId,
            range: `'${BaseRandomStrategy.subcommandToStrings[this.key].data} Data'!A2:D`,
        });

        // Parse the data
        const parsedData = data.reduce<RandomResult[]>((acc, [name, cost, type, description]) =>
        {
            if (this.shouldInclude({
                type,
                includeMega,
                includeBadges,
            }))
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

    private static shouldInclude({
        type,
        includeMega,
        includeBadges,
    }: ShouldIncludeParameters): boolean
    {
        /* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */ // This comes as a string from a spreadsheet - just compare the string values.
        return (
            type === HeldItemTypes.Normal
            || (type === HeldItemTypes.Mega && includeMega)
            || (type === HeldItemTypes.Badge && includeBadges)
        );
        /* eslint-enable @typescript-eslint/no-unsafe-enum-comparison */
    };
}
