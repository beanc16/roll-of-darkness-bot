import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { PtuRandomSubcommand } from '../../subcommand-groups/random.js';
import { BaseRandomStrategy } from './BaseRandomStrategy.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { RandomResult } from '../../../Ptu.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../constants.js';
import { PtuRandomPickupSubcommandResponse, PtuRandomPickupSubcommandStrategy } from './types.js';

@staticImplements<PtuRandomPickupSubcommandStrategy>()
export class RandomApricornStrategy
{
    public static key = PtuRandomSubcommand.Apricorn;

    public static async run(
        interaction: ChatInputCommandInteraction
    ): Promise<boolean | PtuRandomPickupSubcommandResponse>
    {
        // Get parameter results
        const survivalRank = interaction.options.getInteger('survival_rank') as number;
        // const numberOfIterations = interaction.options.getInteger('number_of_iterations') || 1;

        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessPtuSpreadsheetId,
            range: `'${BaseRandomStrategy.subcommandToStrings[this.key].data} Data'!A2:D`,
        });

        // Parse the data
        const parsedData = data.reduce<RandomResult[]>((acc, [name, pokeball]) => {
            acc.push({
                name,
                description: pokeball,
            });
            return acc;
        }, []);

        return await BaseRandomStrategy.run(interaction, this.key, {
            commandName: `ptu random ${this.key}`,
            numberOfDice: survivalRank,
            parsedData,
        });
    }
}
