import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

import { CachedGoogleSheetsApiService } from '../../services/CachedGoogleSheetsApiService.js';
import { PaginationStrategy } from './PaginationStrategy.js';
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
        interaction: ChatInputCommandInteraction,
        embeds: EmbedBuilder[],
        options: {
            noEmbedsErrorMessage: string;
        },
    ): Promise<boolean>
    {
        // Send no results found
        if (embeds.length === 0)
        {
            await interaction.editReply(options.noEmbedsErrorMessage);
            return true;
        }

        // Send messages with pagination (fire and forget)
        PaginationStrategy.run({
            originalInteraction: interaction,
            embeds,
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
