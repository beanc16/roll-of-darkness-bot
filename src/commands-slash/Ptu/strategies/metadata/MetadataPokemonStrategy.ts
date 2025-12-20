import { Text } from '@beanc16/discordjs-helpers';
import { logger } from '@beanc16/logger';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { GoogleSheetsApiErrorType } from '../../../../services/CachedGoogleSheetsApiService/types.js';
import { getPagedEmbedMessages } from '../../../shared/embed-messages/shared.js';
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

        const embeds = this.getEmbeds(spreadsheetValuesResult, characterName);

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

    private static getEmbeds([{ names = [] }]: GetNicknamesResponse[], characterName: PtuCharacterSheetName): EmbedBuilder[]
    {
        const sortedNames = names.sort((a, b) =>
            (a?.startingLevel || 0) - (b?.startingLevel || 0),
        );
        const overview = sortedNames.reduce<{
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

        const pokemonWithDefinedLevels = sortedNames.filter(({ startingLevel }) =>
            startingLevel !== undefined,
        );
        const medianPokemon = pokemonWithDefinedLevels[Math.floor(pokemonWithDefinedLevels.length / 2)];

        const averageLevel = (overview.sumOfLevels / overview.numOfLevelsSummed).toFixed(1);
        const roundedAverageLevel = Math.round(Number(averageLevel));
        const averageLevelBreakdown = sortedNames.reduce<{
            numOfPokemonBelow: number;
            numOfPokemonAt: number;
            numOfPokemonAbove: number;
        }>((acc, { startingLevel }) =>
        {
            if (startingLevel !== undefined)
            {
                if (startingLevel < roundedAverageLevel)
                {
                    acc.numOfPokemonBelow += 1;
                }
                else if (startingLevel === roundedAverageLevel)
                {
                    acc.numOfPokemonAt += 1;
                }
                else
                {
                    acc.numOfPokemonAbove += 1;
                }
            }
            return acc;
        }, {
            numOfPokemonBelow: 0,
            numOfPokemonAt: 0,
            numOfPokemonAbove: 0,
        });
        const numberOfPokemon = sortedNames.length;

        return getPagedEmbedMessages({
            input: sortedNames,
            title: `${characterName}'s Metadata`,
            parseElementToLines: (element, index) => [
                // Add overview before the first element
                ...(index === 0
                    ? [
                        Text.bold('Overview'),
                        `Average Level: ${averageLevel}`,
                        `Lowest Level: ${overview.minLevel} (${overview.minName})`,
                        `Median Level: ${medianPokemon.startingLevel} (${medianPokemon.nickname || medianPokemon.pageName})`,
                        `Highest Level: ${overview.maxLevel} (${overview.maxName})`,
                        '',
                        `Number of Pokemon: ${numberOfPokemon}`,
                        `Below Average Level: ${averageLevelBreakdown.numOfPokemonBelow} Pokemon (${(averageLevelBreakdown.numOfPokemonBelow / numberOfPokemon * 100).toFixed(1)}%)`,
                        `At Average Level: ${averageLevelBreakdown.numOfPokemonAt} Pokemon (${(averageLevelBreakdown.numOfPokemonAt / numberOfPokemon * 100).toFixed(1)}%)`,
                        `Above Average Level: ${averageLevelBreakdown.numOfPokemonAbove} Pokemon (${(averageLevelBreakdown.numOfPokemonAbove / numberOfPokemon * 100).toFixed(1)}%)`,
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
