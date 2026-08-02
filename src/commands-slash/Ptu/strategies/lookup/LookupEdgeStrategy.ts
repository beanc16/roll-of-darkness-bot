import { Text } from '@beanc16/discordjs-helpers';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { getPagedEmbedMessages } from '../../../shared/embed-messages/shared.js';
import { LookupStrategy } from '../../../strategies/BaseLookupStrategy.js';
import { BaseLookupDataOptions } from '../../../strategies/types/types.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../constants.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import { PtuLookupSubcommand } from '../../options/lookup.js';
import { PtuAutocompleteParameterName, PtuLookupRange } from '../../types/autocomplete.js';
import { PtuEdge } from '../../types/PtuEdge.js';
import type { PtuLookupIteractionStrategy } from '../../types/strategies.js';

export interface GetLookupEdgeDataParameters extends BaseLookupDataOptions
{
    name?: string | null;
}

@staticImplements<PtuLookupIteractionStrategy>()
export class LookupEdgeStrategy
{
    public static key: PtuLookupSubcommand.Edge = PtuLookupSubcommand.Edge;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString(PtuAutocompleteParameterName.EdgeName, true);

        const data = await this.getLookupData({
            name,
            includeAllIfNoName: false,
        });

        // Get message
        const embeds = getPagedEmbedMessages({
            input: data,
            title: 'Edges',
            parseElementToLines: element => [
                Text.bold(element.name),
                ...(element.prerequisites !== undefined && element.prerequisites !== '-'
                    ? [
                        `Prerequisites: ${element.prerequisites}`,
                    ]
                    : []
                ),
                ...(element.effect !== undefined && element.effect !== '--'
                    ? [
                        `Effect:\n\`\`\`\n${element.effect}\`\`\``,
                    ]
                    : []
                ),
            ],
        });

        return await LookupStrategy.run(interaction, embeds, {
            commandName: `/ptu ${PtuSubcommandGroup.Lookup} ${PtuLookupSubcommand.Edge}`,
            noEmbedsErrorMessage: 'No edges were found.',
        });
    }

    public static async getLookupData(input: GetLookupEdgeDataParameters = {
        includeAllIfNoName: true,
    }): Promise<PtuEdge[]>
    {
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessPtuSpreadsheetId,
            range: PtuLookupRange.Edge,
        });

        const output = data.reduce<PtuEdge[]>((acc, cur) =>
        {
            const element = new PtuEdge(cur);

            if (element.name.length === 0)
            {
                return acc;
            }

            // cur[0] === name in spreadsheet
            if (!(input.name && input.name.toLowerCase() === element.name.toLowerCase()) && !input.includeAllIfNoName)
            {
                return acc;
            }

            acc.push(element);
            return acc;
        }, []);

        // Sort by name
        output.sort((a, b) => a.name.localeCompare(b.name));

        return output;
    }
}
