import { Text } from '@beanc16/discordjs-helpers';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { getPagedEmbedMessages } from '../../../embed-messages/shared.js';
import { LookupStrategy } from '../../../strategies/BaseLookupStrategy.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { BaseLookupDataOptions } from '../../../strategies/types/types.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../constants.js';
import { PtuLookupSubcommand } from '../../subcommand-groups/lookup.js';
import { PtuAutocompleteParameterName, PtuLookupRange } from '../../types/autocomplete.js';
import { PokeballType } from '../../types/pokeballType.js';
import { PtuPokeball } from '../../types/PtuPokeball.js';

export interface GetLookupPokeballDataParameters extends BaseLookupDataOptions
{
    name?: string | null;
    type?: PokeballType | null;
}

@staticImplements<ChatIteractionStrategy>()
export class LookupPokeballStrategy
{
    public static key = PtuLookupSubcommand.Pokeball;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString(PtuAutocompleteParameterName.PokeballName);
        const type = interaction.options.getString('type') as PokeballType | null;

        const pokeballs = await this.getLookupData({
            name,
            type,
            includeAllIfNoName: false,
        });

        // Get message
        const embeds = getPagedEmbedMessages({
            input: pokeballs,
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
            noEmbedsErrorMessage: 'No pokeballs were found.',
        });
    }

    private static async getLookupData(input: GetLookupPokeballDataParameters = {
        includeAllIfNoName: true,
    }): Promise<PtuPokeball[]>
    {
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessPtuSpreadsheetId,
            range: PtuLookupRange.Pokeball,
        });

        const pokeballs = data.reduce<PtuPokeball[]>((acc, cur) =>
        {
            const pokeball = new PtuPokeball(cur);

            if (pokeball.name === undefined || pokeball.name.trim() === '')
            {
                return acc;
            }

            // Name
            if (input.name && input.name.toLowerCase() !== pokeball.name.toLowerCase() && !input.includeAllIfNoName)
            {
                return acc;
            }

            // Type
            if (input.type && input.type !== pokeball.type)
            {
                return acc;
            }

            acc.push(pokeball);
            return acc;
        }, []);

        // Sort by name
        pokeballs.sort((a, b) =>
            a.name.localeCompare(b.name),
        );

        return pokeballs;
    }
}
