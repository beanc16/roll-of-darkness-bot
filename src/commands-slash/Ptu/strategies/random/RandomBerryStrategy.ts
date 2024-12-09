import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../constants.js';
import { BerryTier, PtuRandomSubcommand } from '../../options/random.js';
import { RandomResult } from '../../types/PtuRandom.js';
import { BaseRandomStrategy } from './BaseRandomStrategy.js';
import { PtuRandomPickupSubcommandResponse, PtuRandomPickupSubcommandStrategy } from './types.js';

interface ShouldIncludeParameters
{
    inputTier: string;
    tier: number;
}

@staticImplements<PtuRandomPickupSubcommandStrategy>()
export class RandomBerryStrategy
{
    public static key: PtuRandomSubcommand.Berry = PtuRandomSubcommand.Berry;

    public static async run(
        interaction: ChatInputCommandInteraction,
        shouldReturnMessageOptions = false,
    ): Promise<boolean | PtuRandomPickupSubcommandResponse>
    {
        const inputTier = interaction.options.getString('berry_tier') || BerryTier.OnePlus;

        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessPtuSpreadsheetId,
            range: `'${BaseRandomStrategy.subcommandToStrings[this.key].data} Data'!A2:D`,
        });

        // Parse the data
        const parsedData = data.reduce<RandomResult[]>((acc, [name, cost, unparsedTier, description]) =>
        {
            const tier = parseInt(unparsedTier, 10);

            if (this.shouldInclude({ inputTier, tier }))
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

    private static shouldInclude({ inputTier, tier }: ShouldIncludeParameters): boolean
    {
        /* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */ // This comes as a string from a spreadsheet - just compare the string values.
        if (inputTier === BerryTier.OnePlus && tier >= 1) return true;
        if (inputTier === BerryTier.One && tier === 1) return true;
        if (inputTier === BerryTier.TwoPlus && tier >= 2) return true;
        if (inputTier === BerryTier.Two && tier === 2) return true;
        if (inputTier === BerryTier.Three && tier === 3) return true;
        return false;
        /* eslint-enable @typescript-eslint/no-unsafe-enum-comparison */
    };
}
