import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { LookupStrategy } from '../../../strategies/BaseLookupStrategy.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { BaseLookupDataOptions } from '../../../strategies/types/types.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../constants.js';
import { getLookupEdgesEmbedMessages } from '../../embed-messages/lookup.js';
import { PtuLookupSubcommand } from '../../subcommand-groups/lookup.js';
import { PtuAutocompleteParameterName } from '../../types/autcomplete.js';
import { PtuEdge } from '../../types/PtuEdge.js';

export interface GetLookupEdgeDataParameters extends BaseLookupDataOptions
{
    name?: string | null;
}

@staticImplements<ChatIteractionStrategy>()
export class LookupEdgeStrategy
{
    public static key: PtuLookupSubcommand.Edge = PtuLookupSubcommand.Edge;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString(PtuAutocompleteParameterName.EdgeName, true);

        const edges = await this.getLookupData({
            name,
            includeAllIfNoName: false,
        });

        // Get message
        const embeds = getLookupEdgesEmbedMessages(edges);

        return await LookupStrategy.run(interaction, embeds, {
            noEmbedsErrorMessage: 'No edges were found.',
        });
    }

    private static async getLookupData(input: GetLookupEdgeDataParameters = {
        includeAllIfNoName: true,
    }): Promise<PtuEdge[]>
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
        edges.sort((a, b) => a.name.localeCompare(b.name));

        return edges;
    }
}
