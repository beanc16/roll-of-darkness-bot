import { ChatInputCommandInteraction } from 'discord.js';

import { ChatIteractionStrategy } from '../../../strategies/ChatIteractionStrategy.js';
import { staticImplements } from '../../../../decorators/staticImplements.js';
import { PtuLookupSubcommand } from '../../subcommand-groups/lookup.js';

import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService.js';
import { getLookupCapabilitiesEmbedMessages } from '../../../Ptu/embed-messages/lookup.js';
import { LookupStrategy } from '../../../strategies/BaseLookupStrategy.js';
import { PtuCapability } from '../../models/PtuCapability.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../constants.js';

export interface GetLookupCapabilityDataParameters
{
    name?: string | null;
    includeAllIfNoName?: boolean;
}

@staticImplements<ChatIteractionStrategy>()
export class LookupCapabilityStrategy
{
    public static key = PtuLookupSubcommand.Capability;

    static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString('capability_name');

        const capabilities = await this.getLookupData({
            name,
            includeAllIfNoName: false,
        });

        // Get message
        const embeds = getLookupCapabilitiesEmbedMessages(capabilities);

        return await LookupStrategy.run(interaction, embeds, {
            noEmbedsErrorMessage: 'No capabilities were found.',
        });
    }

    private static async getLookupData(input: GetLookupCapabilityDataParameters = {
        includeAllIfNoName: true,
    })
    {
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessPtuSpreadsheetId,
            range: `'Capability Data'!A2:Z`,
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
        capabilities.sort((a, b) =>
        {
            return a.name.localeCompare(b.name);
        });

        return capabilities;
    }
}
