import { Text } from '@beanc16/discordjs-helpers';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { getPagedEmbedMessages } from '../../../shared/embed-messages/shared.js';
import { LookupStrategy } from '../../../strategies/BaseLookupStrategy.js';
import { BaseLookupDataOptions } from '../../../strategies/types/types.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../constants.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import { PtuLookupSubcommand } from '../../options/lookup.js';
import { PtuAutocompleteParameterName, PtuLookupRange } from '../../types/autocomplete.js';
import { PtuGiftBlessing } from '../../types/PtuGiftBlessing.js';
import type { PtuLookupIteractionStrategy } from '../../types/strategies.js';

export interface GetLookupGiftBlessingDataParameters extends BaseLookupDataOptions
{
    name?: string | null;
    patron?: string | null;
}

@staticImplements<PtuLookupIteractionStrategy>()
export class LookupGiftBlessingStrategy
{
    public static key: PtuLookupSubcommand.GiftBlessing = PtuLookupSubcommand.GiftBlessing;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString(PtuAutocompleteParameterName.GiftBlessingName);
        const patron = interaction.options.getString(PtuAutocompleteParameterName.GiftBlessingPatron);

        const data = await this.getLookupData({
            name,
            patron,
            includeAllIfNoName: false,
        });

        // Get message
        const embeds = getPagedEmbedMessages({
            input: data,
            title: 'Gifts / Blessings',
            parseElementToLines: element => [
                Text.bold(element.name),
                ...(element.patron !== undefined ? [`Patron: ${element.patron}`] : []),
                ...(element.prerequisites !== undefined ? [`Prerequisites: ${element.prerequisites}`] : []),
                ...(element.frequency !== undefined ? [`Frequency: ${element.frequency}`] : []),
                ...(element.effect !== undefined
                    ? [
                        `Effect:\n\`\`\`\n${element.effect}\`\`\``,
                    ]
                    : []
                ),
            ],
        });

        return await LookupStrategy.run(interaction, embeds, {
            commandName: `/ptu ${PtuSubcommandGroup.Lookup} ${PtuLookupSubcommand.GiftBlessing}`,
            noEmbedsErrorMessage: 'No gifts / blessings were found.',
        });
    }

    public static async getLookupData(input: GetLookupGiftBlessingDataParameters = {
        includeAllIfNoName: true,
    }): Promise<PtuGiftBlessing[]>
    {
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessPtuSpreadsheetId,
            range: PtuLookupRange.GiftBlessing,
        });

        const output = data.reduce<PtuGiftBlessing[]>((acc, cur) =>
        {
            const element = new PtuGiftBlessing(cur);

            // cur[0] === name in spreadsheet
            if (input.name && input.name.toLowerCase() !== element.name.toLowerCase() && !input.includeAllIfNoName)
            {
                return acc;
            }

            // Patron
            if (input.patron && input.patron.toLowerCase() !== element.patron.toLowerCase())
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
