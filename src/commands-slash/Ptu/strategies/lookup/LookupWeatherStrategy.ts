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
import { PtuWeather } from '../../types/PtuWeather.js';
import type { PtuLookupIteractionStrategy } from '../../types/strategies.js';

export interface GetLookupAuraDataParameters extends BaseLookupDataOptions
{
    name?: string | null;
}

@staticImplements<PtuLookupIteractionStrategy>()
export class LookupWeatherStrategy
{
    public static key: PtuLookupSubcommand.Weather = PtuLookupSubcommand.Weather;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString(PtuAutocompleteParameterName.WeatherName);

        const data = await this.getLookupData({
            name,
            includeAllIfNoName: false,
        });

        // Get message
        const embeds = getPagedEmbedMessages({
            input: data,
            title: 'Weather',
            parseElementToLines: element => [
                Text.bold(element.name),
                ...(element.effect !== undefined
                    ? [
                        `Effect:\n\`\`\`\n${element.effect}\`\`\``,
                    ]
                    : []
                ),
            ],
        });

        return await LookupStrategy.run(interaction, embeds, {
            commandName: `/ptu ${PtuSubcommandGroup.Lookup} ${PtuLookupSubcommand.Weather}`,
            noEmbedsErrorMessage: 'No weather was found.',
        });
    }

    public static async getLookupData(input: GetLookupAuraDataParameters = {
        includeAllIfNoName: true,
    }): Promise<PtuWeather[]>
    {
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessPtuSpreadsheetId,
            range: PtuLookupRange.Weather,
        });

        const output = data.reduce<PtuWeather[]>((acc, cur) =>
        {
            const element = new PtuWeather(cur);

            // cur[0] === name in spreadsheet
            if (input.name && input.name.toLowerCase() !== element.name.toLowerCase() && !input.includeAllIfNoName)
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
