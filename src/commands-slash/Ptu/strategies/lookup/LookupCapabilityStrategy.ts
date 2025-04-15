import { Text } from '@beanc16/discordjs-helpers';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { getPagedEmbedMessages } from '../../../embed-messages/shared.js';
import { LookupStrategy } from '../../../strategies/BaseLookupStrategy.js';
import { BaseLookupDataOptions } from '../../../strategies/types/types.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../constants.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import { PtuLookupSubcommand } from '../../options/lookup.js';
import { PtuAutocompleteParameterName, PtuLookupRange } from '../../types/autocomplete.js';
import { PtuCapability } from '../../types/PtuCapability.js';
import { PtuLookupIteractionStrategy } from '../../types/strategies.js';

export interface GetLookupCapabilityDataParameters extends BaseLookupDataOptions
{
    name?: string | null;
}

@staticImplements<PtuLookupIteractionStrategy>()
export class LookupCapabilityStrategy
{
    public static key: PtuLookupSubcommand.Capability = PtuLookupSubcommand.Capability;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString(PtuAutocompleteParameterName.CapabilityName);

        const data = await this.getLookupData({
            name,
            includeAllIfNoName: false,
        });

        // Get message
        const embeds = getPagedEmbedMessages({
            input: data,
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
            commandName: `/ptu ${PtuSubcommandGroup.Lookup} ${PtuLookupSubcommand.Capability}`,
            noEmbedsErrorMessage: 'No capabilities were found.',
        });
    }

    public static async getLookupData(input: GetLookupCapabilityDataParameters = {
        includeAllIfNoName: true,
    }): Promise<PtuCapability[]>
    {
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessPtuSpreadsheetId,
            range: PtuLookupRange.Capability,
        });

        const output = data.reduce<PtuCapability[]>((acc, cur) =>
        {
            const element = new PtuCapability(cur);

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
