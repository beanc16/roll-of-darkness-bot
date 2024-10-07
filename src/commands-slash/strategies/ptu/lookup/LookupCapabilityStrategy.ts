import { ChatInputCommandInteraction } from 'discord.js';

import { ChatIteractionStrategy } from '../../ChatIteractionStrategy.js';
import { staticImplements } from '../../../../decorators/staticImplements.js';
import { PtuLookupSubcommand } from '../../../options/subcommand-groups/ptu/lookup.js';

import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService.js';
import { getLookupCapabilitiesEmbedMessages } from '../../../embed-messages/ptu/lookup.js';
import { BaseLookupRespondStrategy } from './BaseLookupRespondStrategy.js';
import { PtuCapability } from '../../../../models/PtuCapability.js';

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

        // TODO: Add listview and final paginated functionality later

        // Get message
        const embeds = getLookupCapabilitiesEmbedMessages(capabilities);

        return await BaseLookupRespondStrategy.run(interaction, embeds, {
            noEmbedsErrorMessage: 'No capabilities were found.',
        });
    }

    private static async getLookupData(input: GetLookupCapabilityDataParameters = {
        includeAllIfNoName: true,
    })
    {
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: '12_3yiG7PWWnm0UZm8enUcjLd0f4i3XoZQBpkGCHfKJI', // TODO: Make this a constant at some point
            range: `'Capability Data'!A2:Z`,
        });

        const capabilities = data.reduce<PtuCapability[]>((acc, cur) =>
        {
            const capability = new PtuCapability(cur);

            // cur[0] === name in spreadsheet
            if (!(input.name && input.name === capability.name) && !input.includeAllIfNoName)
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
