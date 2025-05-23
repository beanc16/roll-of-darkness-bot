import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../constants.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import { PtuRandomSubcommand } from '../../options/random.js';
import { RandomResult } from '../../types/PtuRandom.js';
import type { PtuStrategyMap } from '../../types/strategies.js';
import { BaseRandomStrategy } from './BaseRandomStrategy.js';
import { PtuRandomPickupSubcommandResponse, PtuRandomPickupSubcommandStrategy } from './types.js';

@staticImplements<PtuRandomPickupSubcommandStrategy>()
export class RandomApricornStrategy
{
    public static key: PtuRandomSubcommand.Apricorn = PtuRandomSubcommand.Apricorn;

    public static async run(
        interaction: ChatInputCommandInteraction,
        _strategies: PtuStrategyMap,
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
        const parsedData = data.reduce<RandomResult[]>((acc, [name, pokeball]) =>
        {
            acc.push({
                name,
                description: pokeball,
            });
            return acc;
        }, []);

        return await BaseRandomStrategy.run(interaction, this.key, {
            commandName: `/ptu ${PtuSubcommandGroup.Random} ${this.key}`,
            numberOfDice: survivalRank,
            parsedData,
        });
    }
}
