import type {
    ButtonInteraction,
    ChatInputCommandInteraction,
    EmbedBuilder,
} from 'discord.js';

import { CachedGoogleSheetsApiService } from '../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { CommandName } from '../../types/discord.js';
import { PaginationStrategy, PaginationStrategyRunParameters } from './PaginationStrategy/PaginationStrategy.js';
import { ChatIteractionStrategy } from './types/ChatIteractionStrategy.js';

export enum BaseGetLookupSearchMatchType
{
    ExactMatch = 'Exact Match',
    SubstringMatch = 'Substring Match',
}

export interface BaseGetLookupDataOptions
{
    matchType: BaseGetLookupSearchMatchType;
}

export interface BaseGetLookupDataParams
{
    options: BaseGetLookupDataOptions;
}

export interface BaseLookupStrategy<Params extends BaseGetLookupDataParams, ClassInstance> extends ChatIteractionStrategy
{
    getLookupData(input: Params): Promise<ClassInstance[]>;
}

export class LookupStrategy
{
    public static async run(
        interaction: ChatInputCommandInteraction | ButtonInteraction,
        embeds: EmbedBuilder[],
        options: {
            commandName: CommandName;
            noEmbedsErrorMessage: string;
            rowsAbovePagination?: PaginationStrategyRunParameters['rowsAbovePagination'];
            onRowAbovePaginationButtonPress?: PaginationStrategyRunParameters['onRowAbovePaginationButtonPress'];
        },
    ): Promise<boolean>
    {
        // Send no results found
        if (embeds.length === 0)
        {
            // Send messages with pagination (fire and forget)
            await PaginationStrategy.run({
                originalInteraction: interaction,
                commandName: options.commandName,
                content: options.noEmbedsErrorMessage,
                rowsAbovePagination: options.rowsAbovePagination,
                onRowAbovePaginationButtonPress: options.onRowAbovePaginationButtonPress,
                includeDeleteButton: true,
            });
            return true;
        }

        // Send messages with pagination (fire and forget)
        // eslint-disable-next-line @typescript-eslint/no-floating-promises -- Leave this hanging to free up memory in the node.js event loop.
        PaginationStrategy.run({
            originalInteraction: interaction,
            commandName: options.commandName,
            embeds,
            rowsAbovePagination: options.rowsAbovePagination,
            onRowAbovePaginationButtonPress: options.onRowAbovePaginationButtonPress,
            includeDeleteButton: true,
        });

        return true;
    }

    public static async getLookupData<ClassInstance extends { name: string }>({
        Class,
        range,
        spreadsheetId,
        reduceCallback = (acc, cur) =>
        {
            acc.push(new Class(cur));
            return acc;
        },
        sortCallback = (a, b) => a.name.localeCompare(b.name),
    }: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Allow in this case so it's a generic class
        Class: new (...args: any[]) => ClassInstance; // Constructor type for any class
        range: string;
        spreadsheetId: string;
        reduceCallback?: (
            acc: ClassInstance[],
            cur: string[],
            index: number,
            array: string[][]
        ) => ClassInstance[];
        sortCallback?: (a: ClassInstance, b: ClassInstance) => number;
    }): Promise<ClassInstance[]>
    {
        // Get data
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId,
            range,
        });

        // Parse & filter data
        const output = data.reduce<ClassInstance[]>(reduceCallback, []);

        // Sort data
        output.sort(sortCallback);

        return output;
    }
}
