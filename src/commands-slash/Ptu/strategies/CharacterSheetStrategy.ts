import {
    type GoogleSheetsGetPageTitleSpreadsheet,
    type GoogleSheetsGetRangeParametersV1,
    GoogleSheetsMicroserviceFilterType,
} from '@beanc16/microservices-abstraction';
import { ChatInputCommandInteraction } from 'discord.js';

import { CachedGoogleSheetsApiService, RetryOptions } from '../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { GoogleSheetsApiErrorType } from '../../../services/CachedGoogleSheetsApiService/types.js';
import { chunkArray } from '../../../services/chunkArray/chunkArray.js';
import { CommandName } from '../../../types/discord.js';
import { getSpreadsheetNameFromSpreadsheetIds } from '../constants.js';

export interface GetSpreadsheetValuesOptions
{
    spreadsheetId: string;
    pokemonName: string;
}

export interface GetSpreadsheetValuesResponse
{
    pageName: string;
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
    isValid: boolean;
}

export interface GetSpreadsheetValuesBatchResponse
{
    spreadsheetId: string;
    values: GetSpreadsheetValuesResponse;
}

interface GetNicknameResponse
{
    nicknameLabel: string;
    nickname: string;
}

export interface GetNicknamesOptions
{
    spreadsheetId: string;
    pokemonNames: string[];
}

export interface GetNicknamesResponse
{
    spreadsheetId: string;
    names: {
        nickname: string;
        pageName: string;
        startingLevel?: number;
    }[];
}

export class CharacterSheetStrategy
{
    protected static baseSpreadsheetRangesToGet = {
        nickname: 'A1:B1',
        species: 'H1:J1',
        totalExp: 'D2:H2',
        trainingExp: 'L10:N10',
        level: 'B2',
    };

    protected static spreadsheetLabels = {
        nickname: 'Nickname',
        species: 'Species',
        totalExp: 'Total EXP',
        expToNextLevel: 'To Next Lvl',
        trainingExp: 'Training Exp:',
    };

    // Does full success or failures, no partial successes
    protected static async getBatchSpreadsheetValues(input: GetSpreadsheetValuesOptions[], options: RetryOptions = {}): Promise<GetSpreadsheetValuesBatchResponse[] | GoogleSheetsApiErrorType | undefined>
    {
        // Parse input data for the spreadsheets
        const {
            ranges,
            spreadsheetIdsSet,
            spreadsheetIdToNumOfExpectedValueRanges,
        } = input.reduce<{
            ranges: GoogleSheetsGetRangeParametersV1[];
            spreadsheetIdsSet: Set<string>;
            spreadsheetIdToNumOfExpectedValueRanges: Record<string, number>;
        }>((acc, cur) =>
        {
            const { pokemonName, spreadsheetId } = cur;

            acc.spreadsheetIdsSet.add(spreadsheetId);

            if (!acc.spreadsheetIdToNumOfExpectedValueRanges[spreadsheetId])
            {
                acc.spreadsheetIdToNumOfExpectedValueRanges[spreadsheetId] = 0;
            }

            Object.values(this.baseSpreadsheetRangesToGet).forEach((range) =>
            {
                acc.spreadsheetIdToNumOfExpectedValueRanges[spreadsheetId] += 1;
                acc.ranges.push({
                    spreadsheetId,
                    range: `'${pokemonName}'!${range}`,
                });
            });

            return acc;
        }, {
            ranges: [],
            spreadsheetIdsSet: new Set<string>(),
            spreadsheetIdToNumOfExpectedValueRanges: {},
        });

        // Get data from the spreadsheet
        const { data = [], errorType } = await CachedGoogleSheetsApiService.getRanges({
            ranges,
            shouldNotCache: true,
            ...options,
        });

        // There was an error
        if (errorType)
        {
            return errorType;
        }

        // We didn't receive data for the same number of spreadsheets in the output that were in the input
        if (data.length !== spreadsheetIdsSet.size)
        {
            return undefined;
        }

        // Parse output
        const { output, receivedUnexpectedNumberOfValueRanges } = data.reduce<{
            output: GetSpreadsheetValuesBatchResponse[];
            receivedUnexpectedNumberOfValueRanges: boolean;
        }>((acc, { spreadsheetId, valueRanges = [] }) =>
        {
            const numOfExpectedValueRanges = spreadsheetIdToNumOfExpectedValueRanges[spreadsheetId];

            if (numOfExpectedValueRanges !== valueRanges.length)
            {
                acc.receivedUnexpectedNumberOfValueRanges = true;
                return acc;
            }

            // Each pokemon maps to 5 items in a row, so chunk by 5s
            const chunkedValueRanges = chunkArray({
                array: valueRanges,
                shouldMoveToNextChunk: (_item, _index, chunk) => chunk.length % 5 === 0,
            });

            chunkedValueRanges.forEach((chunk) =>
            {
                const [
                    {
                        range = '',
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
                                unparsedTotalExp,
                                _2,
                                expToNextLevelLabel,
                                unparsedExpToNextLevel,
                            ],
                        ] = [[]],
                    } = {},
                    {
                        values: [
                            [
                                trainingExpLabel,
                                _3,
                                unparsedTrainingExp,
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
                ] = chunk;

                const totalExp = this.parseToInt(unparsedTotalExp);
                const expToNextLevel = this.parseToInt(unparsedExpToNextLevel);
                const trainingExp = this.parseToInt(unparsedTrainingExp);
                const startingLevel = this.parseToInt(level);

                // All ranges are formatted as 'Page Name'!A1:Z5 (where the letters and numbers are arbitrary)
                const pageNameWithQuotes = range.slice(0, range.indexOf('!'));
                const pageName = pageNameWithQuotes.replaceAll(`'`, '');

                acc.output.push({
                    spreadsheetId,
                    values: {
                        pageName,
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
                        isValid: this.isValidPokemonPage({
                            nicknameLabel,
                            speciesLabel,
                            totalExpLabel,
                            expToNextLevelLabel,
                            trainingExpLabel,
                            totalExp,
                            expToNextLevel,
                            trainingExp,
                            startingLevel,
                        }),
                    },
                });
            });

            return acc;
        }, {
            output: [],
            receivedUnexpectedNumberOfValueRanges: false,
        });

        if (receivedUnexpectedNumberOfValueRanges)
        {
            return undefined;
        }

        return output;
    }

    protected static async getSpreadsheetValues(input: GetSpreadsheetValuesOptions): Promise<GetSpreadsheetValuesResponse | GoogleSheetsApiErrorType | undefined>
    {
        const result = await this.getBatchSpreadsheetValues([input]);

        if (Array.isArray(result))
        {
            const [{ values }] = result;

            return values;
        }

        return result;
    }

    protected static async getAllPokemonNames(spreadsheetIds: string[]): Promise<GoogleSheetsGetPageTitleSpreadsheet[] | GoogleSheetsApiErrorType | undefined>
    {
        const spreadsheetMetadata = spreadsheetIds.map((spreadsheetId) =>
        {
            return { spreadsheetId };
        });

        const { spreadsheets, errorType } = await CachedGoogleSheetsApiService.getPageTitlesBatch({
            spreadsheetMetadata,
            filters: [
                {
                    type: GoogleSheetsMicroserviceFilterType.CaseInsensitiveExcludes,
                    values: [
                        'Read First',
                        'Trainer',
                        'Features',
                        'Feature Wishlist',
                        'Features Wishlist',
                        'Edges',
                        'Edge Wishlist',
                        'Edges Wishlist',
                        'Extras',
                        'Inventory',
                        'Combat',
                        ' Data',
                        ' Template',
                        ' Skills',
                        'Pokédex',
                        'Pokedex',
                        'Calculations',
                        'Poke Edges',
                        'Poké Edges',
                    ],
                },
            ],
        });

        // There was an error
        if (errorType)
        {
            return errorType;
        }

        return spreadsheets;
    }

    /* istanbul ignore next */
    public static async getAllPokemonNamesAndNicknames(spreadsheetIds: string[]): Promise<GetNicknamesResponse[] | GoogleSheetsApiErrorType | undefined>
    {
        const pokemonNamesResponse = await this.getAllPokemonNames(spreadsheetIds);

        if (!Array.isArray(pokemonNamesResponse))
        {
            return pokemonNamesResponse;
        }

        const nicknameInput = pokemonNamesResponse.map(({ spreadsheetId, titles }) =>
        {
            return {
                spreadsheetId,
                pokemonNames: titles,
            };
        });

        const nicknames = await this.getNicknames(nicknameInput);
        return nicknames;
    }

    /* istanbul ignore next */
    protected static async getNickname({ spreadsheetId, pokemonName }: {
        spreadsheetId: string;
        pokemonName: string;
    }): Promise<GetNicknameResponse | GoogleSheetsApiErrorType | undefined>
    {
        const {
            data: [
                [nicknameLabel, nickname],
            ] = [[]],
            errorType,
        } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId,
            range: `'${pokemonName}'!${this.baseSpreadsheetRangesToGet.nickname}`,
            shouldNotCache: true,
        });

        // There was an error
        if (errorType)
        {
            return errorType;
        }

        return {
            nicknameLabel,
            nickname,
        };
    }

    // Does full success or failures, no partial successes
    protected static async getNicknames(options: GetNicknamesOptions[]): Promise<GetNicknamesResponse[] | GoogleSheetsApiErrorType | undefined>
    {
        const input = options.reduce<GetSpreadsheetValuesOptions[]>((
            acc,
            { spreadsheetId, pokemonNames },
        ) =>
        {
            pokemonNames.forEach(pokemonName => acc.push({ spreadsheetId, pokemonName }));
            return acc;
        }, []);

        // Retry with a long wait in case quota is exceeded, as it should reset after a minute
        const result = await this.getBatchSpreadsheetValues(input, {
            secondsBetweenRetries: 7,
            numOfRetries: 10,
        });

        if (!Array.isArray(result))
        {
            return result;
        }

        const spreadsheetIdToNames = result.reduce<
            Record<string, GetNicknamesResponse['names']>
        >((acc, {
            spreadsheetId,
            values: {
                nickname,
                pageName,
                isValid,
                startingLevel,
            },
        }) =>
        {
            if (isValid)
            {
                const { [spreadsheetId]: names = [] } = acc;

                names.push({
                    nickname,
                    pageName,
                    startingLevel,
                });
                acc[spreadsheetId] = names;
            }

            return acc;
        }, {});

        const output = Object.entries(spreadsheetIdToNames).map<GetNicknamesResponse>(([
            spreadsheetId,
            names,
        ]) =>
        {
            return {
                spreadsheetId,
                names,
            };
        }, []);

        return output;
    }

    /* istanbul ignore next */
    protected static async getLevel({ spreadsheetId, pokemonName }: {
        spreadsheetId: string;
        pokemonName: string;
    }): Promise<number | undefined>
    {
        const {
            data: [
                [level],
            ] = [[]],
        } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId,
            range: `'${pokemonName}'!${this.baseSpreadsheetRangesToGet.level}`,
            shouldNotCache: true,
        });

        return this.parseToInt(level);
    }

    protected static parseToInt(input: string): number | undefined
    {
        const output = parseInt(input, 10);

        if (Number.isNaN(output))
        {
            return undefined;
        }

        return output;
    }

    protected static isValidPokemonPage({
        nicknameLabel,
        speciesLabel,
        totalExpLabel,
        expToNextLevelLabel,
        trainingExpLabel,
        totalExp,
        expToNextLevel,
        trainingExp,
        startingLevel,
    }: {
        nicknameLabel?: string;
        speciesLabel?: string;
        totalExpLabel?: string;
        expToNextLevelLabel?: string;
        trainingExpLabel?: string;
        totalExp?: number;
        expToNextLevel?: number;
        trainingExp?: number;
        startingLevel?: number;
    }): boolean
    {
        return (
            nicknameLabel === this.spreadsheetLabels.nickname
            && speciesLabel === this.spreadsheetLabels.species
            && totalExpLabel === this.spreadsheetLabels.totalExp
            && expToNextLevelLabel === this.spreadsheetLabels.expToNextLevel
            && trainingExpLabel === this.spreadsheetLabels.trainingExp
            && totalExp !== undefined
            && expToNextLevel !== undefined
            && trainingExp !== undefined
            && startingLevel !== undefined
        );
    }

    /* istanbul ignore next */
    protected static async handleGoogleSheetsApiError(
        errorType: GoogleSheetsApiErrorType | undefined,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Allow for generic callback handling
        errorTypeToCallbackMap: Partial<Record<GoogleSheetsApiErrorType, () => Promise<any>>>,
    ): Promise<boolean>
    {
        if (errorType === undefined || !errorTypeToCallbackMap[errorType])
        {
            return false;
        }

        await errorTypeToCallbackMap[errorType]();
        return true;
    }

    /* istanbul ignore next */
    protected static async sendPermissionError({
        interaction,
        commandName,
        action,
        maxActionPermission = 'edit',
    }: {
        interaction: ChatInputCommandInteraction;
        commandName: CommandName;
        action: 'view' | 'edit';
        maxActionPermission?: 'view' | 'edit';
    }): Promise<void>
    {
        const howToShareSpreadsheetsHelpArticle = 'https://support.google.com/docs/answer/9331169?hl=en#6.1';

        await interaction.editReply(
            `I don't have permission to ${action} that character sheet. You will be DM'd instructions for how to give me ${maxActionPermission} permissions here shortly.`,
        );

        const maxActionPermissionToRoleName: Record<'view' | 'edit', string> = {
            view: 'viewer',
            edit: 'editor',
        };

        await interaction.user.send(
            `If you want to use \`${commandName}\`, then I need ${maxActionPermission} access on your character sheet. `
            + `If you aren't sure how to give me ${maxActionPermission} permissions, please follow this guide:\n${howToShareSpreadsheetsHelpArticle}.\n\n`
            + `You can either make your sheet editable by anyone with the URL or add this email as an ${maxActionPermissionToRoleName[maxActionPermission]} (whichever you prefer):\n\`${process.env.GOOGLE_SHEETS_MICROSERVICE_EMAIL_ADDRESS}\``,
        );
    }

    /* istanbul ignore next */
    protected static async sendPermissionErrors({
        interaction,
        commandName,
        errorData = [],
        maxActionPermission = 'edit',
    }: {
        interaction: ChatInputCommandInteraction;
        commandName: CommandName;
        errorData: {
            action: 'view' | 'edit';
            spreadsheetId: string;
        }[];
        maxActionPermission?: 'view' | 'edit';
    }): Promise<void>
    {
        const howToShareSpreadsheetsHelpArticle = 'https://support.google.com/docs/answer/9331169?hl=en#6.1';

        const { sheetNamesWithNoViewPerms, sheetNamesWithNoEditPerms } = errorData.reduce<{
            sheetNamesWithNoViewPerms: string[];
            sheetNamesWithNoEditPerms: string[];
        }>((acc, { action, spreadsheetId }) =>
        {
            const spreadsheetName = getSpreadsheetNameFromSpreadsheetIds([spreadsheetId]);

            if (spreadsheetName === undefined)
            {
                return acc;
            }

            if (action === 'view')
            {
                acc.sheetNamesWithNoViewPerms.push(spreadsheetName);
            }

            else if (action === 'edit')
            {
                acc.sheetNamesWithNoEditPerms.push(spreadsheetName);
            }

            return acc;
        }, {
            sheetNamesWithNoViewPerms: [],
            sheetNamesWithNoEditPerms: [],
        });

        const viewText = (sheetNamesWithNoViewPerms.length > 0)
            ? `I don't have permission to view:\n\`\`\`\n ${sheetNamesWithNoViewPerms.join('\n')}\n\`\`\`\n\n`
            : '';

        const editText = (sheetNamesWithNoEditPerms.length > 0)
            ? `I don't have permission to edit:\n\`\`\`\n ${sheetNamesWithNoEditPerms.join('\n')}\n\`\`\`\n\n`
            : '';

        await interaction.followUp(
            viewText + editText
            + `You will be DM'd instructions for how to give me ${maxActionPermission} permissions here shortly.`,
        );

        const maxActionPermissionToRoleName: Record<'view' | 'edit', string> = {
            view: 'viewer',
            edit: 'editor',
        };

        const allSheetNamesWithNoPerms = '```\n' + [
            ...sheetNamesWithNoViewPerms,
            ...sheetNamesWithNoEditPerms,
        ].join('\n') + '\n```';

        const sheetsText = (allSheetNamesWithNoPerms.length > 1)
            ? 'those sheets'
            : 'this sheet';
        await interaction.user.send(
            `If you want to use \`${commandName}\` on ${allSheetNamesWithNoPerms}\nThen I need ${maxActionPermission} access on ${sheetsText}. `
            + `If you aren't sure how to give me ${maxActionPermission} permissions, please follow this guide:\n${howToShareSpreadsheetsHelpArticle}.\n\n`
            + `You can either make your sheet editable by anyone with the URL or add this email as an ${maxActionPermissionToRoleName[maxActionPermission]} (whichever you prefer):\n\`${process.env.GOOGLE_SHEETS_MICROSERVICE_EMAIL_ADDRESS}\``,
        );
    }
}
