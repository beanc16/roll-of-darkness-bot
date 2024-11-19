import { logger } from '@beanc16/logger';
import { ChatInputCommandInteraction } from 'discord.js';

import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService, GoogleSheetsApiErrorType } from '../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { getSpreadsheetIdFromCharacterSheetName } from '../../subcommand-groups/train.js';
import { PtuCharacterSheetName } from '../../types/sheets.js';
import { CharacterSheetStrategy } from '../CharacterSheetStrategy.js';

const howToShareSpreadsheetsHelpArticle = 'https://support.google.com/docs/answer/9331169?hl=en#6.1';

interface GetSpreadsheetValuesResponse {
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

@staticImplements<ChatIteractionStrategy>()
export class TrainPokemonStrategy extends CharacterSheetStrategy
{
    static key = ''; // Not necessary since train only has one strategy
    private static spreadsheetRangesForMiscellaneous = {
        totalExpForUpdate: 'E2',
    };
    private static spreadsheetLabels = {
        nickname: 'Nickname',
        species: 'Species',
        totalExp: 'Total EXP',
        expToNextLevel: 'To Next Lvl',
        trainingExp: 'Training Exp:',
    };

    static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const characterName = interaction.options.getString('character_name', true) as PtuCharacterSheetName;
        const pokemonName = interaction.options.getString('pokemon_page_name', true);
        const numOfTrainingSessions = interaction.options.getInteger('num_of_training_sessions') ?? 1;
        const expPerTrainingSession = interaction.options.getInteger('exp_per_training_session');
        const shouldUseBabyFood = interaction.options.getBoolean('should_use_baby_food') ?? false;

        // Parse spreadsheet id
        const {
            spreadsheetId,
            discordUserIdsOfSpreadsheetEditors,
        } = getSpreadsheetIdFromCharacterSheetName(characterName);

        // Someone is trying to train a pokemon on a sheet they don't own
        if (!discordUserIdsOfSpreadsheetEditors.includes(interaction.user.id))
        {
            await interaction.editReply(
                `The owner of this bot has not given you permission to train Pokémon on this character sheet. `
                + `If you feel that you should have permission to train this character's Pokémon, please contact this bot's owner.`
            );
            return true;
        }

        // Get data from the spreadsheet
        const spreadsheetValuesResult = await this.getSpreadsheetValues({
            spreadsheetId,
            pokemonName,
        });

        // Add safety rail for missing data
        if (!spreadsheetValuesResult)
        {
            await interaction.editReply(
                `Failed to retrieve data for training. Please contact this bot's owner for help fixing the issue.`
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
            const errorType = spreadsheetValuesResult as GoogleSheetsApiErrorType;

            if (errorType === GoogleSheetsApiErrorType.UserNotAddedToSheet)
            {
                await this.sendPermissionError(interaction, 'view');
            }
            else if (errorType === GoogleSheetsApiErrorType.UnableToParseRange)
            {
                await interaction.editReply(
                    `I'm unable to parse data on the page named "${pokemonName}". ` +
                    `Please double check to make sure the page's name is spelled correctly and try again.`
                );
            }
            else
            {
                await interaction.editReply(
                    `An unknown error occurred whilst trying to pull data for the character sheet. Please contact this bot's owner for help fixing the issue.`
                );
                logger.error(`An unknown error occurred whilst trying to pull data for a character sheet in ${this.name}.`, {
                    errorType,
                    characterName,
                    spreadsheetId,
                    pokemonName,
                });
            }
            return true;
        }

        // This is safe to typecast after the prior type guards
        const spreadsheetValues = spreadsheetValuesResult as GetSpreadsheetValuesResponse;

        // Deconstruct values
        const {
            nicknameLabel,
            nickname,
            speciesLabel,
            species,
            totalExpLabel,
            totalExp,
            unparsedTotalExp,
            expToNextLevelLabel,
            expToNextLevel,
            unparsedExpToNextLevel,
            trainingExpLabel,
            trainingExp,
            unparsedTrainingExp,
            startingLevel,
        } = spreadsheetValues;

        // Add safety rail for a non-pokemon sheet getting used
        if (
            nicknameLabel !== this.spreadsheetLabels.nickname
            || speciesLabel !== this.spreadsheetLabels.species
            || totalExpLabel !== this.spreadsheetLabels.totalExp
            || expToNextLevelLabel !== this.spreadsheetLabels.expToNextLevel
            || trainingExpLabel !== this.spreadsheetLabels.trainingExp
            || totalExp === undefined
            || expToNextLevel === undefined
            || trainingExp === undefined
            || startingLevel === undefined
        )
        {
            await interaction.editReply(
                `The given page was found on the character sheet, but doesn't appear to follow the expected Pokémon template. ` +
                `Please check to make sure the "Nickname", "Species", "Total EXP", "To Next Lvl", and "Training Exp:" ` +
                `parts of the given page are named as such and are in the same place on the Pokémon template page.`
            );
            logger.warn('Data for training a pokemon does not match the expected Pokémon template', {
                characterName,
                spreadsheetId,
                pokemonName,
                nicknameLabel,
                nickname,
                speciesLabel,
                species,
                totalExpLabel,
                totalExp,
                unparsedTotalExp,
                expToNextLevelLabel,
                expToNextLevel,
                unparsedExpToNextLevel,
                trainingExpLabel,
                trainingExp,
                unparsedTrainingExp,
            });
            return true;
        }

        // Add baby food safety rail
        if (shouldUseBabyFood && startingLevel > 15)
        {
            await interaction.editReply(
                `Tried to use baby food, but ${nickname ?? pokemonName} is level ${startingLevel}. ` +
                `Baby food can only be used by pokemon of level 15 or lower. ` +
                `Please try again without using baby food.`
            );
            return true;
        }

        // Train the pokemon
        const {
            errorType,
            newTotalExp,
        } = await this.train({
            interaction,
            spreadsheetId,
            pokemonName,
            totalExp,
            expToNextLevel,
            trainingExp,
            numOfTrainingSessions,
            expPerTrainingSessionOverride: expPerTrainingSession,
            shouldUseBabyFood: (shouldUseBabyFood && startingLevel! <= 15),
        });

        if (errorType === GoogleSheetsApiErrorType.UserNotAddedToSheet)
        {
            await this.sendPermissionError(interaction, 'edit');
            return true;
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

    private static async getLevel({
        spreadsheetId,
        pokemonName,
    }: {
        spreadsheetId: string;
        pokemonName: string;
    })
    {
        const {
            data: [
                [level]
            ] = [[]],
        } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId,
            range: `'${pokemonName}'!${this.baseSpreadsheetRangesToGet.level}`,
            shouldNotCache: true,
        });

        return this.parseToInt(level);
    }

    private static async train({
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
    }): Promise<{ newTotalExp: number; errorType?: GoogleSheetsApiErrorType; }>
    {
        const {
            newTotalExp,
            newNumOfTrainingSessionsLeft,
        } = this.calculateTrainingExp({
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
                expToNextLevel,
                trainingExp: updatedTrainingExp,
                startingLevel,
            } = await this.getSpreadsheetValues({
                spreadsheetId,
                pokemonName,
            }) as GetSpreadsheetValuesResponse ?? {};

            // Continue training
            return await this.train({
                interaction,
                spreadsheetId,
                pokemonName,
                totalExp: newTotalExp,
                expToNextLevel: expToNextLevel as number,
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
    })
    {
        let newTotalExp = totalExp;
        let newExpToNextLevel = expToNextLevel;
        const babyFoodMultiplier = (shouldUseBabyFood) ? 1.2 : 1;
        const expToTrainWith = Math.floor((expPerTrainingSessionOverride ?? trainingExp) * babyFoodMultiplier);

        for (let index = 1; index <= numOfTrainingSessions; index++)
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

    private static async sendPermissionError(interaction: ChatInputCommandInteraction, action: 'view' | 'edit')
    {
        await interaction.editReply(
            `I don't have permission to ${action} that character sheet. You will be DM'd instructions for how to give me edit permissions here shortly.`
        );
        await interaction.user.send(
            `If you want to use \`/ptu train\`, then I need edit access to your character sheet. ` +
            `If you aren't sure how to give me edit permissions, please follow this guide:\n${howToShareSpreadsheetsHelpArticle}.\n\n` +
            `You can either make your sheet editable by anyone with the URL or add this email as an editor (whichever you prefer):\n\`${process.env.GOOGLE_SHEETS_MICROSERVICE_EMAIL_ADDRESS}\``
        );
    }
}