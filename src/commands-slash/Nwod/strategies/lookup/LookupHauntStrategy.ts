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
import { GeistHaunt } from '../../types/GeistHaunt.js';
import { NwodAutocompleteParameterName, NwodLookupRange } from '../../types/lookup.js';

export interface GetLookupHauntDataOptions extends BaseLookupDataOptions
{
    name?: string | null;
}

@staticImplements<ChatIteractionStrategy>()
export class LookupHauntStrategy
{
    public static key = NwodLookupSubcommand.Haunt;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString(NwodAutocompleteParameterName.HauntName, true);

        const data = await this.getLookupData({
            name,
            includeAllIfNoName: false,
        });

        // Get message
        const embeds = getPagedEmbedMessages({
            input: data,
            title: 'Haunts',
            parseElementToLines: element => [
                `${Text.bold(element.name)} (${element.dots})`,
                ...(element.activationRoll !== undefined
                    ? [`Activation Roll: ${element.activationRoll}`]
                    : []
                ),
                ...(element.associatedHaunt !== undefined
                    ? [`Associated Haunt: ${element.associatedHaunt}`]
                    : []
                ),
                ...(element.associatedPowers !== undefined
                    ? [`Associated Powers:\n${element.associatedPowers.join('\t\n')}`]
                    : []
                ),
                ...(element.cost !== undefined
                    ? [`Cost: ${element.cost}`]
                    : []
                ),
                ...(element.action !== undefined
                    ? [`Action: ${element.action}`]
                    : []
                ),
                ...(element.pageNumber !== undefined
                    ? [`Page Number: ${element.pageNumber}`]
                    : []
                ),
                ...(element.effect !== undefined
                    ? [
                        `Effect:\n\`\`\`\n${element.effect}\`\`\``,
                    ]
                    : []
                ),
                ...(element.enhancements !== undefined
                    ? [
                        `Enhancements:\n\`\`\`\n${element.enhancements}\`\`\``,
                    ]
                    : []
                ),
            ],
        });

        return await LookupStrategy.run(interaction, embeds, {
            commandName: `/nwod ${NwodSubcommandGroup.Lookup} ${NwodLookupSubcommand.Haunt}`,
            noEmbedsErrorMessage: 'No haunts were found.',
        });
    }

    private static async getLookupData(input: GetLookupHauntDataOptions = {
        includeAllIfNoName: true,
    }): Promise<GeistHaunt[]>
    {
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessNwodSpreadsheetId,
            range: NwodLookupRange.Haunt,
        });

        const output = data.reduce<GeistHaunt[]>((acc, cur) =>
        {
            const element = new GeistHaunt(cur);

            // Name
            if (input.name && input.name.toLowerCase() !== element.name.toLowerCase() && !input.includeAllIfNoName)
            {
                return acc;
            }

            acc.push(element);
            return acc;
        }, []);

        // For each element that's a proper haunt, add its
        // associated powers to the output after the haunt.
        if (!input.includeAllIfNoName)
        {
            output.forEach((element, index) =>
            {
                let addedAssociatedPowers = index + 1;

                if (element.associatedHaunt === undefined)
                {
                    data.forEach(row =>
                    {
                        const haunt = new GeistHaunt(row);

                        if (element.name === haunt.associatedHaunt)
                        {
                            output.splice(addedAssociatedPowers, 0, haunt);
                            addedAssociatedPowers += 1;
                        }
                    });
                }
            });
        }

        if (input.includeAllIfNoName)
        {
            // Sort by name
            output.sort((a, b) =>
                a.name.localeCompare(b.name),
            );
        }

        return output;
    }
}
