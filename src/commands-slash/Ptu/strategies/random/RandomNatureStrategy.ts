import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { DiceLiteService } from '../../../../services/DiceLiteService.js';
import { DiscordInteractionCallbackType } from '../../../../types/discord.js';
import { OnRerollCallbackOptions, RerollStrategy } from '../../../strategies/RerollStrategy.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../constants.js';
import { getRandomNatureEmbedMessage } from '../../embed-messages/random.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import { PtuRandomSubcommand } from '../../options/random.js';
import { PtuNature } from '../../types/PtuNature.js';
import { BaseRandomStrategy } from './BaseRandomStrategy.js';

interface GetRandomNaturesResult
{
    natures: PtuNature[];
    rollResults: string;
}

@staticImplements<ChatIteractionStrategy>()
export class RandomNatureStrategy
{
    public static key: PtuRandomSubcommand.Nature = PtuRandomSubcommand.Nature;

    public static async run(
        interaction: ChatInputCommandInteraction,
        rerollCallbackOptions: OnRerollCallbackOptions = {
            interactionCallbackType: DiscordInteractionCallbackType.EditReply,
        },
    ): Promise<boolean>
    {
        // Get parameter results
        const numberOfDice = interaction.options.getInteger('number_of_dice') ?? 1;

        // Get all natures
        const { natures, rollResults } = await this.getRandomNatures(numberOfDice);

        // Get embed message
        const embed = getRandomNatureEmbedMessage({
            itemNamePluralized: BaseRandomStrategy.subcommandToStrings[
                PtuRandomSubcommand.Nature
            ].plural,
            results: natures,
            rollResults,
        });

        // Send embed with reroll button
        await RerollStrategy.run({
            interaction,
            options: {
                embeds: [embed],
            },
            interactionCallbackType: rerollCallbackOptions.interactionCallbackType,
            onRerollCallback: newRerollCallbackOptions => this.run(
                interaction,
                newRerollCallbackOptions,
            ),
            commandName: `/ptu ${PtuSubcommandGroup.Random} ${this.key}`,
        });

        return true;
    }

    /* istanbul ignore next */
    private static async getNatures(): Promise<PtuNature[]>
    {
        // Pull data from spreadsheet
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessPtuSpreadsheetId,
            range: `'${BaseRandomStrategy.subcommandToStrings[
                PtuRandomSubcommand.Nature
            ].data} Data'!A2:E`,
        });

        // Parse data
        const parsedData = data.reduce<PtuNature[]>((acc, cur) =>
        {
            acc.push(
                new PtuNature(cur),
            );
            return acc;
        }, []);

        return parsedData;
    }

    public static async getRandomNatures(numOfNatures: number): Promise<GetRandomNaturesResult>
    {
        // Get all natures
        const allNatures = await this.getNatures();

        // Get random numbers
        const rollResult = new DiceLiteService({
            count: numOfNatures,
            sides: allNatures.length,
        }).roll();
        const rollResults = rollResult.join(', ');

        // Get random natures
        const natures = rollResult.map(roll => allNatures[roll - 1]);

        return {
            natures,
            rollResults,
        };
    }
}
