import { logger } from '@beanc16/logger';
import type { NonOptional } from '@beanc16/utility-types';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { GoogleSheetsApiErrorType } from '../../../../services/CachedGoogleSheetsApiService/types.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { getSpreadsheetIdFromCharacterSheetName, PtuTrainSubcommand } from '../../options/train.js';
import { PtuCharacterSheetName } from '../../types/sheets.js';
import { CharacterSheetStrategy } from '../CharacterSheetStrategy.js';

interface GetSpreadsheetValuesResponse
{
    nicknameLabel: string;
    nickname: string;
    speciesLabel: string;
    species: string;
    totalExpLabel: string;
    totalExp?: number;
    unparsedTotalExp: string;
    expToNextLevelLabel: string;
    expToNextLevel?: number;
    unparsedExpToNextLevel: string;
    trainingExpLabel: string;
    trainingExp?: number;
    unparsedTrainingExp: string;
    startingLevel?: number;
}

interface CalculateTrainingExpResponse
{
    newTotalExp: number;
    newExpToNextLevel?: number;
    newNumOfTrainingSessionsLeft: number;
}

@staticImplements<ChatIteractionStrategy>()
export class TrainPokemonStrategy extends CharacterSheetStrategy
{
    public static key = PtuTrainSubcommand.Train;
    private static spreadsheetRangesForMiscellaneous = {
        totalExpForUpdate: 'E2',
    };

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const characterName = interaction.options.getString('character_name', true) as PtuCharacterSheetName;
        const pokemonName = interaction.options.getString('pokemon_page_name', true);
        const numOfTrainingSessions = interaction.options.getInteger('num_of_training_sessions') ?? 1;
        const expPerTrainingSession = interaction.options.getInteger('exp_per_training_session');
        const shouldUseBabyFood = interaction.options.getBoolean('should_use_baby_food') ?? false;

        // Parse spreadsheet id
        const { spreadsheetId, discordUserIdsOfSpreadsheetEditors } = getSpreadsheetIdFromCharacterSheetName(characterName);

        // Someone is trying to train a pokemon on a sheet they don't own
        if (!discordUserIdsOfSpreadsheetEditors.includes(interaction.user.id))
        {
            await interaction.editReply(
                `The owner of this bot has not given you permission to train Pokémon on this character sheet. `
                + `If you feel that you should have permission to train this character's Pokémon, please contact this bot's owner.`,
            );
            return true;
        }

        // Get data from the spreadsheet
        const spreadsheetValuesResult = await this.getSpreadsheetValues({
            spreadsheetId,
            pokemonName,
        });

        // Add safety rail for missing data
        if (spreadsheetValuesResult === undefined)
        {
            await interaction.editReply(
                `Failed to retrieve data for training. Please contact this bot's owner for help fixing the issue.`,
            );
            logger.warn('Failed to retrieve data for training a pokemon', {
                characterName,
                spreadsheetId,
                pokemonName,
            });
            return true;
        }

        if (typeof spreadsheetValuesResult === 'string')
        {
            await this.handleGoogleSheetsApiError(spreadsheetValuesResult, {
                [GoogleSheetsApiErrorType.UserNotAddedToSheet]: async () => await this.sendPermissionError({
                    interaction,
                    commandName: '/ptu train',
                    action: 'view',
                }),
                [GoogleSheetsApiErrorType.UnableToParseRange]: async () => await interaction.editReply(
                    `I'm unable to parse data on the page named "${pokemonName}". `
                    + `Please double check to make sure the page's name is spelled correctly and try again.`,
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
                        pokemonName,
                    });
                },
            });

            return true;
        }

        // Add safety rail for a non-pokemon sheet getting used
        if (!spreadsheetValuesResult.isValid)
        {
            await interaction.editReply(
                `The given page was found on the character sheet, but doesn't appear to follow the expected Pokémon template. `
                + `Please check to make sure the "Nickname", "Species", "Total EXP", "To Next Lvl", and "Training Exp:" `
                + `parts of the given page are named as such and are in the same place on the Pokémon template page.`,
            );
            logger.warn('Data for training a pokemon does not match the expected Pokémon template', {
                characterName,
                spreadsheetId,
                pokemonName,
                ...spreadsheetValuesResult,
            });
            return true;
        }

        // This is safe to typecast after the prior type guards
        const {
            nickname,
            totalExp,
            expToNextLevel,
            trainingExp,
            startingLevel,
        } = spreadsheetValuesResult as NonOptional<GetSpreadsheetValuesResponse>;

        // Add baby food safety rail
        if (shouldUseBabyFood && startingLevel > 15)
        {
            await interaction.editReply(
                `Tried to use baby food, but ${nickname ?? pokemonName} is level ${startingLevel}. `
                + `Baby food can only be used by pokemon of level 15 or lower. `
                + `Please try again without using baby food.`,
            );
            return true;
        }

        // Train the pokemon
        const { errorType, newTotalExp } = await this.trainPokemon({
            interaction,
            spreadsheetId,
            pokemonName,
            totalExp,
            expToNextLevel,
            trainingExp,
            numOfTrainingSessions,
            expPerTrainingSessionOverride: expPerTrainingSession,
            shouldUseBabyFood: (shouldUseBabyFood && startingLevel <= 15),
        });

        const wasError = await this.handleGoogleSheetsApiError(errorType, {
            [GoogleSheetsApiErrorType.UserNotAddedToSheet]: async () => await this.sendPermissionError({
                interaction,
                commandName: '/ptu train',
                action: 'edit',
            }),
            [GoogleSheetsApiErrorType.UnknownError]: async () => await interaction.editReply(
                `An unknown error occurred whilst trying to update data on the character sheet. Please contact this bot's owner for help fixing the issue.`,
            ),
        });

        if (wasError)
        {
            return wasError;
        }

        const newLevel = await this.getLevel({
            spreadsheetId,
            pokemonName,
        });

        const leveledUpText = (newLevel !== undefined && startingLevel === newLevel)
            ? ''
            : ` leveled up from ${startingLevel} to ${newLevel} and`;
        const expGained = newTotalExp - totalExp;
        const trainingSessionText = (numOfTrainingSessions === 1)
            ? ''
            : ` after ${numOfTrainingSessions} training sessions`;
        await interaction.editReply(`${nickname ?? pokemonName}${leveledUpText} gained ${expGained} exp${trainingSessionText}`);

        return true;
    }

    private static async trainPokemon({
        interaction,
        spreadsheetId,
        pokemonName,
        totalExp,
        expToNextLevel,
        trainingExp,
        numOfTrainingSessions,
        expPerTrainingSessionOverride,
        shouldUseBabyFood,
    }: {
        interaction: ChatInputCommandInteraction;
        spreadsheetId: string;
        pokemonName: string;
        totalExp: number;
        expToNextLevel: number;
        trainingExp: number;
        numOfTrainingSessions: number;
        expPerTrainingSessionOverride: number | null;
        shouldUseBabyFood: boolean;
    }): Promise<{ newTotalExp: number; errorType?: GoogleSheetsApiErrorType }>
    {
        const { newTotalExp, newNumOfTrainingSessionsLeft } = this.calculateTrainingExp({
            totalExp,
            expToNextLevel,
            trainingExp,
            numOfTrainingSessions,
            expPerTrainingSessionOverride,
            shouldUseBabyFood,
        });

        // Apply training to the character sheet
        const { errorType } = await CachedGoogleSheetsApiService.update({
            spreadsheetId,
            range: `'${pokemonName}'!${this.spreadsheetRangesForMiscellaneous.totalExpForUpdate}`,
            values: [
                [`${newTotalExp}`],
            ],
            shouldNotCache: true,
        });

        if (errorType)
        {
            return {
                newTotalExp: -1,
                errorType,
            };
        }

        // Continue training more if there's more sessions left
        if (newNumOfTrainingSessionsLeft > 0)
        {
            // Get updated data from the spreadsheet (in case training exp has been updated)
            const {
                expToNextLevel: newExpToNextLevel,
                trainingExp: updatedTrainingExp,
                startingLevel,
            } = await this.getSpreadsheetValues({
                spreadsheetId,
                pokemonName,
            }) as GetSpreadsheetValuesResponse ?? {};

            // Continue training
            return await this.trainPokemon({
                interaction,
                spreadsheetId,
                pokemonName,
                totalExp: newTotalExp,
                expToNextLevel: newExpToNextLevel as number,
                trainingExp: updatedTrainingExp as number,
                numOfTrainingSessions: newNumOfTrainingSessionsLeft,
                expPerTrainingSessionOverride,
                shouldUseBabyFood: (shouldUseBabyFood && startingLevel! <= 15),
            });
        }

        return { newTotalExp };
    }

    private static calculateTrainingExp({
        totalExp,
        expToNextLevel,
        trainingExp,
        numOfTrainingSessions,
        expPerTrainingSessionOverride,
        shouldUseBabyFood,
    }: {
        totalExp: number;
        expToNextLevel: number;
        trainingExp: number;
        numOfTrainingSessions: number;
        expPerTrainingSessionOverride: number | null;
        shouldUseBabyFood: boolean;
    }): CalculateTrainingExpResponse
    {
        let newTotalExp = totalExp;
        let newExpToNextLevel = expToNextLevel;
        const babyFoodMultiplier = (shouldUseBabyFood) ? 1.2 : 1;
        const expToTrainWith = Math.floor((expPerTrainingSessionOverride ?? trainingExp) * babyFoodMultiplier);

        for (let index = 1; index <= numOfTrainingSessions; index += 1)
        {
            newTotalExp += expToTrainWith;
            newExpToNextLevel -= expToTrainWith;

            if (newExpToNextLevel <= 0)
            {
                return {
                    newTotalExp,
                    newExpToNextLevel,
                    newNumOfTrainingSessionsLeft: numOfTrainingSessions - index,
                };
            }
        }

        return {
            newTotalExp,
            newNumOfTrainingSessionsLeft: 0,
        };
    }
}
