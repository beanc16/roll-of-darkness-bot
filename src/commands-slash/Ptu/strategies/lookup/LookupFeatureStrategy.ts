import { Text } from '@beanc16/discordjs-helpers';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { getPagedEmbedMessages } from '../../../embed-messages/shared.js';
import { LookupStrategy } from '../../../strategies/BaseLookupStrategy.js';
import { BaseLookupDataOptions } from '../../../strategies/types/types.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../constants.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import { PtuLookupSubcommand } from '../../options/lookup.js';
import { PtuAutocompleteParameterName, PtuLookupRange } from '../../types/autocomplete.js';
import { PtuFeature } from '../../types/PtuFeature.js';
import type { PtuLookupIteractionStrategy } from '../../types/strategies.js';

export interface GetLookupFeatureDataParameters extends BaseLookupDataOptions
{
    names?: (string | null)[];
    sortByName: boolean;
}

@staticImplements<PtuLookupIteractionStrategy>()
export class LookupFeatureStrategy
{
    public static key: PtuLookupSubcommand.Feature = PtuLookupSubcommand.Feature;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString(PtuAutocompleteParameterName.FeatureName, true);

        const data = await this.getLookupData({
            names: [name],
            includeAllIfNoName: false,
            sortByName: true,
        });

        // Get message
        const embeds = this.getEmbedMessages(data);

        return await LookupStrategy.run(interaction, embeds, {
            commandName: `/ptu ${PtuSubcommandGroup.Lookup} ${PtuLookupSubcommand.Feature}`,
            noEmbedsErrorMessage: 'No features were found.',
        });
    }

    public static async getLookupData(input: GetLookupFeatureDataParameters = {
        includeAllIfNoName: true,
        sortByName: true,
    }): Promise<PtuFeature[]>
    {
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessPtuSpreadsheetId,
            range: PtuLookupRange.Feature,
        });

        const parsedInput = {
            ...input,
            names: input.names?.reduce<Set<string>>((acc, name) =>
            {
                // Filter out nulls
                if (name)
                {
                    acc.add(name.toLowerCase());
                }

                return acc;
            }, new Set<string>()),
        };

        const output = data.reduce<PtuFeature[]>((acc, cur) =>
        {
            const element = new PtuFeature(cur);

            if (element.name.length === 0)
            {
                return acc;
            }

            // cur[0] === name in spreadsheet
            if (parsedInput.names && parsedInput.names.size > 0 && !parsedInput.names.has(element.name.toLowerCase()) && !parsedInput.includeAllIfNoName)
            {
                return acc;
            }

            acc.push(element);
            return acc;
        }, []);

        // Sort by name
        if (input.sortByName)
        {
            output.sort((a, b) => a.name.localeCompare(b.name));
        }

        return output;
    }

    public static getEmbedMessages(data: PtuFeature[], title = 'Features'): EmbedBuilder[]
    {
        const embeds = getPagedEmbedMessages({
            input: data,
            title,
            parseElementToLines: element => [
                Text.bold(element.name),
                ...(element.tags !== undefined && element.tags !== '-'
                    ? [
                        `Tags: ${element.tags}`,
                    ]
                    : []
                ),
                ...(element.prerequisites !== undefined && element.prerequisites !== '-'
                    ? [
                        `Prerequisites: ${element.prerequisites}`,
                    ]
                    : []
                ),
                ...(element.frequencyAndAction !== undefined && element.frequencyAndAction !== '-'
                    ? [
                        `Frequency / Action: ${element.frequencyAndAction}`,
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

        return embeds;
    }
}
