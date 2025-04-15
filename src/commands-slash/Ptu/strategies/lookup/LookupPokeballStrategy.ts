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
import { PokeballType } from '../../types/pokeballType.js';
import { PtuPokeball } from '../../types/PtuPokeball.js';
import type { PtuLookupIteractionStrategy } from '../../types/strategies.js';

export interface GetLookupPokeballDataParameters extends BaseLookupDataOptions
{
    name?: string | null;
    type?: PokeballType | null;
}

@staticImplements<PtuLookupIteractionStrategy>()
export class LookupPokeballStrategy
{
    public static key = PtuLookupSubcommand.Pokeball;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString(PtuAutocompleteParameterName.PokeballName);
        const type = interaction.options.getString('type') as PokeballType | null;

        const data = await this.getLookupData({
            name,
            type,
            includeAllIfNoName: false,
        });

        // Get message
        const embeds = getPagedEmbedMessages({
            input: data,
            title: 'Pokeballs',
            parseElementToLines: element => [
                Text.bold(element.name),
                ...(element.cost !== undefined ? [`Cost: ${element.cost}`] : []),
                ...(element.modifier !== undefined ? [`Modifier: ${element.modifier}`] : []),
                ...(element.type !== undefined ? [`Type: ${element.type}`] : []),
                ...(element.description !== undefined && element.description !== '--'
                    ? [
                        `Description:\n\`\`\`\n${element.description}\`\`\``,
                    ]
                    : []
                ),
            ],
        });

        return await LookupStrategy.run(interaction, embeds, {
            commandName: `/ptu ${PtuSubcommandGroup.Lookup} ${PtuLookupSubcommand.Pokeball}`,
            noEmbedsErrorMessage: 'No pokeballs were found.',
        });
    }

    public static async getLookupData(input: GetLookupPokeballDataParameters = {
        includeAllIfNoName: true,
    }): Promise<PtuPokeball[]>
    {
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessPtuSpreadsheetId,
            range: PtuLookupRange.Pokeball,
        });

        const output = data.reduce<PtuPokeball[]>((acc, cur) =>
        {
            const element = new PtuPokeball(cur);

            if (element.name === undefined || element.name.trim() === '')
            {
                return acc;
            }

            // Name
            if (input.name && input.name.toLowerCase() !== element.name.toLowerCase() && !input.includeAllIfNoName)
            {
                return acc;
            }

            // Type
            if (input.type && input.type !== element.type)
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
