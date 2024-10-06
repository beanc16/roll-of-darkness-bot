import { ChatInputCommandInteraction } from 'discord.js';

import { ChatIteractionStrategy } from '../../ChatIteractionStrategy.js';
import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService.js';
import { CharacterSheetName, getSpreadsheetIdFromCharacterSheetName } from '../../../options/subcommand-groups/ptu/train.js';
import { logger } from '@beanc16/logger';

@staticImplements<ChatIteractionStrategy>()
export class TrainPokemonStrategy
{
    static key = ''; // Not necessary since train only has one strategy
    private static spreadsheetRangesToGetForTraining = {
        nickname: 'A1:B1',
        species: 'H1:J1',
        totalExp: 'D2:H2',
        trainingExp: 'L10:N10',
        level: 'B2',
    };
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
        const characterName = interaction.options.getString('character_name') as CharacterSheetName | null;
        const spreadsheetId = interaction.options.getString('spreadsheet_id');
        const pokemonName = interaction.options.getString('pokemon_page_name', true);
        const numOfTrainingSessions = interaction.options.getInteger('num_of_training_sessions') ?? 1;
        const expPerTrainingSession = interaction.options.getInteger('exp_per_training_session');

        // Safeguard necessary variables
        const numOfTruthyValues = [characterName, spreadsheetId].filter(Boolean).length;
        if (numOfTruthyValues === 0)
        {
            await interaction.editReply('Cannot train a pokemon without providing a character_name or spreadsheet_id.');
            return true;
        }
        else if (numOfTruthyValues > 1)
        {
            await interaction.editReply('Cannot train a pokemon when providing both character_name and spreadsheet_id.');
            return true;
        }

        // Parse spreadsheet id
        const {
            spreadsheetId: parsedSpreadsheetId,
            discordUserIdsOfSpreadsheetEditors,
        } = this.getSpreadsheetId({
            interaction,
            characterName,
            spreadsheetId,
        });

        // Someone is trying to train a pokemon on a sheet they don't own
        if (!discordUserIdsOfSpreadsheetEditors.includes(interaction.user.id))
        {
            await interaction.editReply(`Cannot train a pokemon on a character sheet that you don't own.`);
            return true;
        }

        // Get data from the spreadsheet
        const spreadsheetValues = await this.getSpreadsheetValues({
            spreadsheetId: parsedSpreadsheetId,
            pokemonName,
        });

        // Add safety rail for missing data
        if (!spreadsheetValues)
        {
            await interaction.editReply('Failed to retrieve data for training.');
            logger.warn('Failed to retrieve data for training a pokemon', {
                characterName,
                spreadsheetId,
                parsedSpreadsheetId,
                pokemonName,
            });
            return true;
        }

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

        // Add safety rail for non-pokemon sheet getting used
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
            await interaction.editReply(`Cannot train on a sheet that doesn't follow the pokemon template.`);
            logger.warn('Failed to retrieve data for training a pokemon', {
                characterName,
                spreadsheetId,
                parsedSpreadsheetId,
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

        // TODO
        const { newTotalExp } = await this.train({
            spreadsheetId: parsedSpreadsheetId,
            pokemonName,
            totalExp,
            expToNextLevel,
            trainingExp,
            numOfTrainingSessions,
            expPerTrainingSessionOverride: expPerTrainingSession,
        });

        const newLevel = await this.getLevel({
            spreadsheetId: parsedSpreadsheetId,
            pokemonName,
        });
        console.log('\n levels:', {
            startingLevel,
            newLevel,
        });

        const leveledUpText = (newLevel !== undefined && startingLevel === newLevel)
            ? ''
            : ` leveled up from ${startingLevel} to ${newLevel} and`;
        const expGained = newTotalExp - totalExp;
        const trainingSessionText = (numOfTrainingSessions === 1)
            ? ''
            : ` after ${numOfTrainingSessions} training sessions`;
        await interaction.editReply(`${nickname}${leveledUpText} gained ${expGained} exp${trainingSessionText}`);

        return true;
    }

    private static getSpreadsheetId({
        interaction,
        characterName,
        spreadsheetId,
    }: {
        interaction: ChatInputCommandInteraction;
        characterName: CharacterSheetName | null;
        spreadsheetId: string | null;
    })
    {
        if (characterName)
        {
            return getSpreadsheetIdFromCharacterSheetName(characterName);
        }

        return {
            spreadsheetId: spreadsheetId as string,
            discordUserIdsOfSpreadsheetEditors: interaction.user.id,
        };
    }

    private static async getSpreadsheetValues({
        spreadsheetId,
        pokemonName,
    }: {
        spreadsheetId: string;
        pokemonName: string;
    })
    {
        // Parse data for the spreadsheet
        const ranges = Object.values(this.spreadsheetRangesToGetForTraining).map((range) => {
            return {
                spreadsheetId,
                range: `'${pokemonName}'!${range}`,
            };
        });

        // Get data from the spreadsheet
        const [
            {
                valueRanges = [],
            } = {},
        ] = await CachedGoogleSheetsApiService.getRanges({
            ranges,
        }) ?? [];

        if (ranges.length !== valueRanges.length)
        {
            return undefined;
        }

        const [
            {
                values: [
                    [
                        nicknameLabel,
                        nickname,
                    ],
                ] = [[]],
            } = {},
            {
                values: [
                    [
                        speciesLabel,
                        _1,
                        species,
                    ],
                ] = [[]],
            } = {},
            {
                values: [
                    [
                        totalExpLabel,
                        totalExp,
                        _2,
                        expToNextLevelLabel,
                        expToNextLevel,
                    ],
                ] = [[]],
            } = {},
            {
                values: [
                    [
                        trainingExpLabel,
                        _3,
                        trainingExp,
                    ],
                ] = [[]],
            } = {},
            {
                values: [
                    [
                        level,
                    ],
                ] = [[]],
            } = {},
        ] = valueRanges;

        return {
            nicknameLabel,
            nickname,
            speciesLabel,
            species,
            totalExpLabel,
            totalExp: this.parseToInt(totalExp),
            unparsedTotalExp: totalExp,
            expToNextLevelLabel,
            expToNextLevel: this.parseToInt(expToNextLevel),
            unparsedExpToNextLevel: totalExp,
            trainingExpLabel,
            trainingExp: this.parseToInt(trainingExp),
            unparsedTrainingExp: trainingExp,
            startingLevel: this.parseToInt(level),
        };
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
            range: `'${pokemonName}'!${this.spreadsheetRangesToGetForTraining.level}`,
            shouldNotCache: true,
        });

        return this.parseToInt(level);
    }

    private static parseToInt(input: string): number | undefined
    {
        const output = parseInt(input, 10);

        if (Number.isNaN(output))
        {
            return undefined;
        }

        return output;
    }

    private static async train({
        spreadsheetId,
        pokemonName,
        totalExp,
        expToNextLevel,
        trainingExp,
        numOfTrainingSessions,
        expPerTrainingSessionOverride,
    }: {
        spreadsheetId: string;
        pokemonName: string;
        totalExp: number;
        expToNextLevel: number;
        trainingExp: number;
        numOfTrainingSessions: number;
        expPerTrainingSessionOverride: number | null;
    }): Promise<{ newTotalExp: number }>
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
        });

        // Apply training to the character sheet
        await CachedGoogleSheetsApiService.update({
            spreadsheetId,
            range: `'${pokemonName}'!${this.spreadsheetRangesForMiscellaneous.totalExpForUpdate}`,
            values: [
                [`${newTotalExp}`],
            ],
        });

        // Continue training more if there's more sessions left
        if (newNumOfTrainingSessionsLeft > 0)
        {
            // Get updated data from the spreadsheet (in case training exp has been updated)
            const {
                expToNextLevel,
                trainingExp: updatedTrainingExp,
            } = await this.getSpreadsheetValues({
                spreadsheetId,
                pokemonName,
            }) ?? {};

            // Continue training
            return await this.train({
                spreadsheetId,
                pokemonName,
                totalExp: newTotalExp,
                expToNextLevel: expToNextLevel as number,
                trainingExp: updatedTrainingExp as number,
                numOfTrainingSessions: newNumOfTrainingSessionsLeft,
                expPerTrainingSessionOverride,
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
    }: {
        totalExp: number;
        expToNextLevel: number;
        trainingExp: number;
        numOfTrainingSessions: number;
        expPerTrainingSessionOverride: number | null;
    })
    {
        let newTotalExp = totalExp;
        let newExpToNextLevel = expToNextLevel;
        const expToTrainWith = expPerTrainingSessionOverride ?? trainingExp;

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
}