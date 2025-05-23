import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../constants.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import { PtuRandomSubcommand } from '../../options/random.js';
import { HeldItemType } from '../../types/PtuHeldItem.js';
import { RandomResult } from '../../types/PtuRandom.js';
import type { PtuStrategyMap } from '../../types/strategies.js';
import { BaseRandomStrategy } from './BaseRandomStrategy.js';
import { PtuRandomPickupSubcommandResponse, PtuRandomPickupSubcommandStrategy } from './types.js';

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
        _strategies: PtuStrategyMap,
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
            commandName: `/ptu ${PtuSubcommandGroup.Random} ${this.key}`,
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
            type === HeldItemType.Normal
            || (type === HeldItemType.Mega && includeMega)
            || (type === HeldItemType.Badge && includeBadges)
        );
        /* eslint-enable @typescript-eslint/no-unsafe-enum-comparison */
    };
}
