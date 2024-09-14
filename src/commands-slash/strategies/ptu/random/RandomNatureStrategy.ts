import { ChatInputCommandInteraction } from 'discord.js';

import { ChatIteractionStrategy } from '../../ChatIteractionStrategy.js';
import { staticImplements } from '../../../../decorators/staticImplements.js';
import { PtuRandomSubcommand } from '../../../options/subcommand-groups/ptu/random.js';
import { DiceLiteService } from '../../../../services/DiceLiteService.js';
import { getRandomNatureEmbedMessage } from '../../../embed-messages/ptu/random.js';
import { RandomNature } from '../../../Ptu.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService.js';
import { BaseRandomStrategy } from './BaseRandomStrategy.js';

@staticImplements<ChatIteractionStrategy>()
export class RandomNatureStrategy
{
    public static key = PtuRandomSubcommand.Nature;

    static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const numberOfDice = interaction.options.getInteger('number_of_dice') ?? 1;

        // Pull data from spreadsheet
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            // TODO: Make this spreadsheet id a constant later
            spreadsheetId: '12_3yiG7PWWnm0UZm8enUcjLd0f4i3XoZQBpkGCHfKJI',
            range: `'${BaseRandomStrategy.subcommandToStrings[
                PtuRandomSubcommand.Nature
            ].data} Data'!A2:E`,
        });

        // Parse data
        const parsedData = data.reduce<RandomNature[]>((acc, [
            name,
            raisedStat,
            loweredStat,
            likedFlavor,
            dislikedFlavor
        ]) => {
            acc.push({
                name,
                raisedStat,
                loweredStat,
                likedFlavor,
                dislikedFlavor,
            });
            return acc;
        }, []);

        // Get random numbers
        const rollResult = new DiceLiteService({
            count: numberOfDice,
            sides: parsedData.length,
        }).roll();
        const rollResults = rollResult.join(', ');

        // Get random items
        const results = rollResult.map((roll) => parsedData[roll - 1]);

        // Get embed message
        const embed = getRandomNatureEmbedMessage({
            itemNamePluralized: BaseRandomStrategy.subcommandToStrings[
                PtuRandomSubcommand.Nature
            ].plural,
            results,
            rollResults,
        });

        // Send embed
        await interaction.editReply({
            embeds: [embed],
        });

        return true;
    }
}
