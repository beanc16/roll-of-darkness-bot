import { Text } from '@beanc16/discordjs-helpers';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { getPagedEmbedMessages } from '../../../embed-messages/shared.js';
import { LookupStrategy } from '../../../strategies/BaseLookupStrategy.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { BaseLookupDataOptions } from '../../../strategies/types/types.js';
import { rollOfDarknessNwodSpreadsheetId } from '../../constants.js';
import { NwodSubcommandGroup } from '../../options/index.js';
import { NwodLookupSubcommand } from '../../options/lookup.js';
import {
    GeistKey,
    GeistMemento,
    GeistMementoType,
} from '../../types/GeistMemento.js';
import { NwodAutocompleteParameterName, NwodLookupRange } from '../../types/lookup.js';

export interface GetLookupMementoDataOptions extends BaseLookupDataOptions
{
    name?: string | null;
    key?: GeistKey | null;
    type?: GeistMementoType | null;
}

@staticImplements<ChatIteractionStrategy>()
export class LookupMementoStrategy
{
    public static key = NwodLookupSubcommand.Memento;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString(NwodAutocompleteParameterName.MementoName);
        const key = interaction.options.getString('key') as GeistKey | null;
        const type = interaction.options.getString('type') as GeistMementoType | null;

        const data = await this.getLookupData({
            name,
            key,
            type,
            includeAllIfNoName: false,
        });

        // Get message
        const embeds = getPagedEmbedMessages({
            input: data,
            title: 'Mementos',
            parseElementToLines: element => [
                Text.bold(element.name),
                ...(element.key !== undefined
                    ? [`Key: ${element.key}`]
                    : []
                ),
                ...(element.type !== undefined
                    ? [`Type: ${element.type}`]
                    : []
                ),
                ...(element.pageNumber !== undefined
                    ? [`Page Number: ${element.pageNumber}`]
                    : []
                ),
                ...(element.description !== undefined
                    ? [
                        `Description:\n\`\`\`\n${element.description}\`\`\``,
                    ]
                    : []
                ),
                ...(element.effect !== undefined
                    ? [
                        `Effect:\n\`\`\`\n${element.effect}\`\`\``,
                    ]
                    : []
                ),
            ],
        });

        return await LookupStrategy.run(interaction, embeds, {
            commandName: `/nwod ${NwodSubcommandGroup.Lookup} ${NwodLookupSubcommand.Memento}`,
            noEmbedsErrorMessage: 'No mementos were found.',
        });
    }

    private static async getLookupData(input: GetLookupMementoDataOptions = {
        includeAllIfNoName: true,
    }): Promise<GeistMemento[]>
    {
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessNwodSpreadsheetId,
            range: NwodLookupRange.Memento,
        });

        const output = data.reduce<GeistMemento[]>((acc, cur) =>
        {
            // Ignore empty rows
            if (cur[0] === undefined || cur[0].trim() === '')
            {
                return acc;
            }

            const element = new GeistMemento(cur);

            // Name
            if (input.name && input.name.toLowerCase() !== element.name.toLowerCase() && !input.includeAllIfNoName)
            {
                return acc;
            }

            // Key
            if (input.key && input.key.toLowerCase() !== element.key.toLowerCase())
            {
                return acc;
            }

            // Type
            if (input.type && input.type.toLowerCase() !== element.type.toLowerCase())
            {
                return acc;
            }

            acc.push(element);
            return acc;
        }, []);

        // Sort by name
        output.sort((a, b) =>
            a.name.localeCompare(b.name),
        );

        return output;
    }
}
