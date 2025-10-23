import { Text } from '@beanc16/discordjs-helpers';
import { logger } from '@beanc16/logger';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { GoogleSheetsApiErrorType } from '../../../../services/CachedGoogleSheetsApiService/types.js';
import { getPagedEmbedMessages } from '../../../embed-messages/shared.js';
import { PaginationStrategy } from '../../../strategies/PaginationStrategy/PaginationStrategy.js';
import { getSpreadsheetIdFromCharacterSheetName } from '../../constants.js';
import { PtuMetadataSubcommand } from '../../options/metadata.js';
import { PtuCharacterSheetName } from '../../types/sheets.js';
import type { PtuChatIteractionStrategy } from '../../types/strategies.js';
import { CharacterSheetStrategy, GetNicknamesResponse } from '../CharacterSheetStrategy.js';

@staticImplements<PtuChatIteractionStrategy>()
export class MetadataPokemonStrategy extends CharacterSheetStrategy
{
    public static key = PtuMetadataSubcommand.Metadata;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const characterName = interaction.options.getString('character_name', true) as PtuCharacterSheetName;

        // Parse spreadsheet id
        const { spreadsheetId } = getSpreadsheetIdFromCharacterSheetName(characterName);

        // Get data from the spreadsheet
        const spreadsheetValuesResult = await this.getAllPokemonNamesAndNicknames([
            spreadsheetId,
        ]);

        // Add safety rail for missing data
        if (spreadsheetValuesResult === undefined)
        {
            await interaction.editReply(
                `Failed to retrieve data. Please contact this bot's owner for help fixing the issue.`,
            );
            logger.warn('Failed to retrieve data for training a pokemon', {
                characterName,
                spreadsheetId,
            });
            return true;
        }

        if (typeof spreadsheetValuesResult === 'string')
        {
            await this.handleGoogleSheetsApiError(spreadsheetValuesResult, {
                [GoogleSheetsApiErrorType.UserNotAddedToSheet]: async () => await this.sendPermissionError({
                    interaction,
                    commandName: `/ptu ${PtuMetadataSubcommand.Metadata}`,
                    action: 'view',
                }),
                [GoogleSheetsApiErrorType.UnableToParseRange]: async () => await interaction.editReply(
                    `I'm unable to parse data. `
                    + `Please contact this bot's owner for help fixing the issue.`,
                ),
                [GoogleSheetsApiErrorType.UnknownError]: async () =>
                {
                    await interaction.editReply(
                        `An unknown error occurred whilst trying to pull data for the character sheet. Please contact this bot's owner for help fixing the issue.`,
                    );
                    logger.error(`An unknown error occurred whilst trying to pull data for a character sheet in ${this.name}.`, {
                        errorType: spreadsheetValuesResult,
                        characterName,
                        spreadsheetId,
                    });
                },
            });

            return true;
        }

        const embeds = this.getEmbeds(spreadsheetValuesResult);

        // Send messages with pagination (fire and forget)
        // eslint-disable-next-line @typescript-eslint/no-floating-promises -- Leave this hanging to free up memory in the node.js event loop.
        PaginationStrategy.run({
            originalInteraction: interaction,
            commandName: `/ptu ${PtuMetadataSubcommand.Metadata}`,
            embeds,
            includeDeleteButton: true,
        });

        return true;
    }

    private static getEmbeds([{ names = [] }]: GetNicknamesResponse[]): EmbedBuilder[]
    {
        const overview = names.sort((a, b) =>
            (a?.startingLevel || 0) - (b?.startingLevel || 0),
        ).reduce<{
            sumOfLevels: number;
            numOfLevelsSummed: number;
            minLevel: number;
            minName: string;
            maxLevel: number;
            maxName: string;
        }>((acc, {
            nickname,
            pageName,
            startingLevel,
        }) =>
        {
            if (startingLevel !== undefined)
            {
                acc.sumOfLevels += startingLevel;
                acc.numOfLevelsSummed += 1;

                if (startingLevel < acc.minLevel)
                {
                    acc.minLevel = startingLevel;
                    acc.minName = nickname || pageName;
                }

                if (startingLevel > acc.maxLevel)
                {
                    acc.maxLevel = startingLevel;
                    acc.maxName = nickname || pageName;
                }
            }

            return acc;
        }, {
            sumOfLevels: 0,
            numOfLevelsSummed: 0,
            minLevel: 999,
            minName: '',
            maxLevel: 0,
            maxName: '',
        });

        const averageLevel = (overview.sumOfLevels / overview.numOfLevelsSummed).toFixed(2);

        return getPagedEmbedMessages({
            input: names,
            title: 'Metadata',
            parseElementToLines: (element, index) => [
                // Add overview before the first element
                ...(index === 0
                    ? [
                        Text.bold('Overview'),
                        `Average Level: ${averageLevel}`,
                        `Lowest Level: ${overview.minLevel} (${overview.minName})`,
                        `Highest Level: ${overview.maxLevel} (${overview.maxName})`,
                        '',
                    ]
                    : []),

                // Each individual element
                Text.bold(element.nickname || element.pageName),
                `Page Name: ${element.pageName}`,
                ...(element.startingLevel !== undefined
                    ? [
                        `Level: ${element.startingLevel}`,
                    ]
                    : []
                ),
                '',
            ],
        });
    }
}
