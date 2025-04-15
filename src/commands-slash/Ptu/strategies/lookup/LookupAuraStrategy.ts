import { Text } from '@beanc16/discordjs-helpers';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { getPagedEmbedMessages } from '../../../embed-messages/shared.js';
import { LookupStrategy } from '../../../strategies/BaseLookupStrategy.js';
import { BaseLookupDataOptions } from '../../../strategies/types/types.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../constants.js';
import { PtuAura } from '../../models/PtuAura.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import { PtuLookupSubcommand } from '../../options/lookup.js';
import { PtuAutocompleteParameterName, PtuLookupRange } from '../../types/autocomplete.js';
import { PtuLookupIteractionStrategy } from '../../types/strategies.js';

export interface GetLookupAuraDataParameters extends BaseLookupDataOptions
{
    name?: string | null;
    userName?: string | null;
    returnLegendaryNames?: boolean;
}

@staticImplements<PtuLookupIteractionStrategy>()
export class LookupAuraStrategy
{
    public static key: PtuLookupSubcommand.Aura = PtuLookupSubcommand.Aura;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString(PtuAutocompleteParameterName.AuraName);
        const userName = interaction.options.getString(PtuAutocompleteParameterName.AuraUserName);

        const data = await this.getLookupData({
            name,
            userName,
            includeAllIfNoName: false,
        }) as PtuAura[];

        // Get message
        const embeds = getPagedEmbedMessages({
            input: data,
            title: 'Auras',
            parseElementToLines: element => [
                Text.bold(element.name),
                ...(element.legendaries !== undefined && element.legendaries.length > 0
                    ? [
                        `Legendaries:\n\`\`\`\n${element.legendaries.join(', ')}\`\`\``,
                    ]
                    : []
                ),
                ...(element.effect !== undefined
                    ? [
                        `Effect:\n\`\`\`\n${element.effect}\`\`\``,
                    ]
                    : []
                ),
            ],
        });

        return await LookupStrategy.run(interaction, embeds, {
            commandName: `/ptu ${PtuSubcommandGroup.Lookup} ${PtuLookupSubcommand.Aura}`,
            noEmbedsErrorMessage: 'No auras were found.',
        });
    }

    public static async getLookupData(input: GetLookupAuraDataParameters = {
        includeAllIfNoName: true,
        returnLegendaryNames: false,
    }): Promise<PtuAura[] | { name: string }[]>
    {
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessPtuSpreadsheetId,
            range: PtuLookupRange.Aura,
        });

        const output = data.reduce<PtuAura[]>((acc, cur) =>
        {
            const element = new PtuAura(cur);

            // Name
            if (input.name && input.name.toLowerCase() !== element.name.toLowerCase() && !input.includeAllIfNoName)
            {
                return acc;
            }

            // User's Name
            if (input.userName && !(
                element.legendaries.some(legendary =>
                    legendary.toLowerCase().includes(input.userName?.toLowerCase() as string) && (
                        !(
                            !input.userName?.toLowerCase()?.includes('galarian')
                            && legendary.toLowerCase().includes(`galarian ${input.userName}`.toLowerCase())
                        )
                        && !(
                            !input.userName?.toLowerCase()?.includes('mewtwo')
                            && legendary.toLowerCase().includes('mewtwo')
                        )
                    ),
                )
                || element.legendaryGroups.some(group => group.toLowerCase().includes(input.userName?.toLowerCase() as string))
            ))
            {
                return acc;
            }

            acc.push(element);
            return acc;
        }, []);

        // Sort by name
        output.sort((a, b) => a.name.localeCompare(b.name));

        // Return auras
        if (!input.returnLegendaryNames)
        {
            return output;
        }

        // Return legendary names and legendary group names
        const legendaryNames = output.reduce<{ name: string }[]>((acc, aura) =>
        {
            aura.legendaries.forEach(name =>
            {
                const nameWithoutCommentsAndAuraNames = name
                    .replace(/\[.*?\]/g, '')
                    .replace(/\(.*?\)/g, '')
                    .trim();

                acc.push({ name: nameWithoutCommentsAndAuraNames });
            });
            aura.legendaryGroups.forEach(name => acc.push({ name }));
            return acc;
        }, []);

        // Sort by name
        legendaryNames.sort((a, b) => a.name.localeCompare(b.name));
        return legendaryNames;
    }
}
