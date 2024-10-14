import { ChatInputCommandInteraction } from 'discord.js';

import { ChatIteractionStrategy } from '../../../strategies/ChatIteractionStrategy.js';
import { staticImplements } from '../../../../decorators/staticImplements.js';
import { PtuLookupSubcommand } from '../../subcommand-groups/lookup.js';

import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService.js';
import { getLookupEdgesEmbedMessages } from '../../embed-messages/lookup.js';
import { BaseLookupRespondStrategy } from './BaseLookupRespondStrategy.js';
import { PtuEdge } from '../../models/PtuEdge.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../constants.js';

export interface GetLookupEdgeDataParameters
{
    name?: string | null;
    includeAllIfNoName?: boolean;
}

@staticImplements<ChatIteractionStrategy>()
export class LookupEdgeStrategy
{
    public static key = PtuLookupSubcommand.Edge;

    static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString('edge_name', true);

        const edges = await this.getLookupData({
            name,
            includeAllIfNoName: false,
        });

        // Get message
        const embeds = getLookupEdgesEmbedMessages(edges);

        return await BaseLookupRespondStrategy.run(interaction, embeds, {
            noEmbedsErrorMessage: 'No edges were found.',
        });
    }

    private static async getLookupData(input: GetLookupEdgeDataParameters = {
        includeAllIfNoName: true,
    })
    {
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessPtuSpreadsheetId,
            range: `'Edges Data'!A2:Z`,
        });

        const edges = data.reduce<PtuEdge[]>((acc, cur) =>
        {
            const edge = new PtuEdge(cur);

            if (edge.name.length === 0)
            {
                return acc;
            }

            // cur[0] === name in spreadsheet
            if (!(input.name && input.name.toLowerCase() === edge.name.toLowerCase()) && !input.includeAllIfNoName)
            {
                return acc;
            }

            acc.push(edge);
            return acc;
        }, []);

        // Sort by name
        edges.sort((a, b) =>
        {
            return a.name.localeCompare(b.name);
        });

        return edges;
    }
}
