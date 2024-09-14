import { ChatInputCommandInteraction } from 'discord.js';

import { ChatIteractionStrategy } from '../../ChatIteractionStrategy.js';
import { staticImplements } from '../../../../decorators/staticImplements.js';
import { PtuRandomSubcommand } from '../../../options/subcommand-groups/ptu/random.js';
import { BaseRandomStrategy } from './BaseRandomStrategy.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService.js';
import { RandomResult } from '../../../Ptu.js';

@staticImplements<ChatIteractionStrategy>()
export class RandomApricornStrategy
{
    public static key = PtuRandomSubcommand.Apricorn;

    static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const survivalRank = interaction.options.getInteger('survival_rank') as number;
        // const numberOfIterations = interaction.options.getInteger('number_of_iterations') || 1;

        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            // TODO: Make this spreadsheet id a constant later
            spreadsheetId: '12_3yiG7PWWnm0UZm8enUcjLd0f4i3XoZQBpkGCHfKJI',
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
            numberOfDice: survivalRank,
            parsedData,
        });
    }
}
