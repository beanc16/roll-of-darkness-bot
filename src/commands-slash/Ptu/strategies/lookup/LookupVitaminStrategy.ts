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
import { PtuVitamin, PtuVitaminEnhancedStat } from '../../types/PtuVitamin.js';
import type { PtuLookupIteractionStrategy } from '../../types/strategies.js';

export interface GetLookupVitaminDataParameters extends BaseLookupDataOptions
{
    name?: string | null;
    enhancedStat?: PtuVitaminEnhancedStat | null;
}

@staticImplements<PtuLookupIteractionStrategy>()
export class LookupVitaminStrategy
{
    public static key: PtuLookupSubcommand.Vitamin = PtuLookupSubcommand.Vitamin;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString(PtuAutocompleteParameterName.VitaminName);
        const enhancedStat = interaction.options.getString('enhanced_stat') as PtuVitaminEnhancedStat | null;

        const data = await this.getLookupData({
            name,
            enhancedStat,
            includeAllIfNoName: false,
        });

        // Get message
        const embeds = getPagedEmbedMessages({
            input: data,
            title: 'Vitamins',
            parseElementToLines: element => [
                Text.bold(element.name),
                ...(element.cost !== undefined ? [`Cost: ${element.cost}`] : []),
                ...(element.description !== undefined
                    ? [
                        `Description:\n\`\`\`\n${element.description}\`\`\``,
                    ]
                    : []
                ),
            ],
        });

        return await LookupStrategy.run(interaction, embeds, {
            commandName: `/ptu ${PtuSubcommandGroup.Lookup} ${PtuLookupSubcommand.Vitamin}`,
            noEmbedsErrorMessage: 'No vitamins were found.',
        });
    }

    public static async getLookupData(input: GetLookupVitaminDataParameters = {
        includeAllIfNoName: true,
    }): Promise<PtuVitamin[]>
    {
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessPtuSpreadsheetId,
            range: PtuLookupRange.Vitamin,
        });

        const output = data.reduce<PtuVitamin[]>((acc, cur) =>
        {
            const element = new PtuVitamin(cur);

            // cur[0] === name in spreadsheet
            if (input.name && input.name.toLowerCase() !== element.name.toLowerCase() && !input.includeAllIfNoName)
            {
                return acc;
            }

            // Enhanced Stat
            if (
                input.enhancedStat
                && (
                    (input.enhancedStat !== PtuVitaminEnhancedStat.TutorPoints && !element.description.toLowerCase().includes(`user’s ${input.enhancedStat.toLowerCase()}`))
                    || (input.enhancedStat === PtuVitaminEnhancedStat.TutorPoints && !element.description.toLowerCase().includes(input.enhancedStat.toLowerCase()))
                )
            )
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
