import { Text } from '@beanc16/discordjs-helpers';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { getPagedEmbedMessages } from '../../../embed-messages/shared.js';
import { LookupStrategy } from '../../../strategies/BaseLookupStrategy.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { BaseLookupDataOptions } from '../../../strategies/types/types.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../constants.js';
import { PtuLookupSubcommand } from '../../subcommand-groups/lookup.js';
import { PtuAutocompleteParameterName, PtuLookupRange } from '../../types/autocomplete.js';
import { PtuCapability } from '../../types/PtuCapability.js';

export interface GetLookupCapabilityDataParameters extends BaseLookupDataOptions
{
    name?: string | null;
}

@staticImplements<ChatIteractionStrategy>()
export class LookupCapabilityStrategy
{
    public static key: PtuLookupSubcommand.Capability = PtuLookupSubcommand.Capability;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString(PtuAutocompleteParameterName.CapabilityName);

        const capabilities = await this.getLookupData({
            name,
            includeAllIfNoName: false,
        });

        // Get message
        const embeds = getPagedEmbedMessages({
            input: capabilities,
            title: 'Capabilities',
            parseElementToLines: element => [
                Text.bold(element.name),
                ...(element.description !== undefined && element.description !== '--'
                    ? [
                        `Description:\n\`\`\`\n${element.description}\`\`\``,
                    ]
                    : []
                ),
            ],
        });

        return await LookupStrategy.run(interaction, embeds, {
            noEmbedsErrorMessage: 'No capabilities were found.',
        });
    }

    private static async getLookupData(input: GetLookupCapabilityDataParameters = {
        includeAllIfNoName: true,
    }): Promise<PtuCapability[]>
    {
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessPtuSpreadsheetId,
            range: PtuLookupRange.Capability,
        });

        const capabilities = data.reduce<PtuCapability[]>((acc, cur) =>
        {
            const capability = new PtuCapability(cur);

            // cur[0] === name in spreadsheet
            if (!(input.name && input.name.toLowerCase() === capability.name.toLowerCase()) && !input.includeAllIfNoName)
            {
                return acc;
            }

            acc.push(capability);
            return acc;
        }, []);

        // Sort by name
        capabilities.sort((a, b) => a.name.localeCompare(b.name));

        return capabilities;
    }
}
