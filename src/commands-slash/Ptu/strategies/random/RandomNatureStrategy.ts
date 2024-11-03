import { ChatInputCommandInteraction } from 'discord.js';

import { ChatIteractionStrategy } from '../../../strategies/ChatIteractionStrategy.js';
import { staticImplements } from '../../../../decorators/staticImplements.js';
import { PtuRandomSubcommand } from '../../subcommand-groups/random.js';
import { DiceLiteService } from '../../../../services/DiceLiteService.js';
import { getRandomNatureEmbedMessage } from '../../../Ptu/embed-messages/random.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService.js';
import { BaseRandomStrategy } from './BaseRandomStrategy.js';
import { PtuNature } from '../../models/PtuNature.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../constants.js';
import { OnRerollCallbackOptions, RerollStrategy } from '../../../strategies/RerollStrategy.js';
import { DiscordInteractionCallbackType } from '../../../../types/discord.js';

@staticImplements<ChatIteractionStrategy>()
export class RandomNatureStrategy
{
    public static key = PtuRandomSubcommand.Nature;

    public static async run(
        interaction: ChatInputCommandInteraction,
        rerollCallbackOptions: OnRerollCallbackOptions = {
            interactionCallbackType: DiscordInteractionCallbackType.EditReply,
        },
    ): Promise<boolean>
    {
        // Get parameter results
        const numberOfDice = interaction.options.getInteger('number_of_dice') ?? 1;

        // Pull data from spreadsheet
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessPtuSpreadsheetId,
            range: `'${BaseRandomStrategy.subcommandToStrings[
                PtuRandomSubcommand.Nature
            ].data} Data'!A2:E`,
        });

        // Parse data
        const parsedData = data.reduce<PtuNature[]>((acc, cur) => {
            acc.push(
                new PtuNature(cur)
            );
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

        // Send embed with reroll button
        await RerollStrategy.run({
            interaction,
            options: {
                embeds: [embed],
            },
            interactionCallbackType: rerollCallbackOptions.interactionCallbackType,
            onRerollCallback: (newRerollCallbackOptions) => this.run(
                interaction,
                newRerollCallbackOptions,
            ),
            commandName: `ptu random ${this.key}`,
        });

        return true;
    }
}
