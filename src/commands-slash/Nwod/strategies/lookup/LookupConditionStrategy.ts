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
import { NwodAutocompleteParameterName, NwodLookupRange } from '../../types/lookup.js';
import { NwodCondition } from '../../types/NwodCondition.js';

export interface GetLookupMeritDataOptions extends BaseLookupDataOptions
{
    name?: string | null;
}

@staticImplements<ChatIteractionStrategy>()
export class LookupConditionStrategy
{
    public static key = NwodLookupSubcommand.Condition;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString(NwodAutocompleteParameterName.ConditionName);

        const data = await this.getLookupData({
            name,
            includeAllIfNoName: false,
        });

        // Get message
        const embeds = getPagedEmbedMessages({
            input: data,
            title: 'Conditions',
            parseElementToLines: element => [
                Text.bold(element.name),
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
                ...(element.resolution !== undefined
                    ? [
                        `Resolution:\n\`\`\`\n${element.resolution}\`\`\``,
                    ]
                    : []
                ),
                ...(element.beat !== undefined
                    ? [
                        `Beat:\n\`\`\`\n${element.beat}\`\`\``,
                    ]
                    : []
                ),
                ...(element.possibleSources !== undefined
                    ? [
                        `Possible Sources:\n\`\`\`\n${element.possibleSources}\`\`\``,
                    ]
                    : []
                ),
            ],
        });

        return await LookupStrategy.run(interaction, embeds, {
            commandName: `/nwod ${NwodSubcommandGroup.Lookup} ${NwodLookupSubcommand.Condition}`,
            noEmbedsErrorMessage: 'No conditions were found.',
        });
    }

    private static async getLookupData(input: GetLookupMeritDataOptions = {
        includeAllIfNoName: true,
    }): Promise<NwodCondition[]>
    {
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessNwodSpreadsheetId,
            range: NwodLookupRange.Condition,
        });

        const output = data.reduce<NwodCondition[]>((acc, cur) =>
        {
            // Ignore empty rows
            if (cur[0] === undefined || cur[0].trim() === '')
            {
                return acc;
            }

            const element = new NwodCondition(cur);

            if (element.name === undefined || element.name.trim() === '')
            {
                return acc;
            }

            // Name
            if (input.name && input.name.toLowerCase() !== element.name.toLowerCase() && !input.includeAllIfNoName)
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
