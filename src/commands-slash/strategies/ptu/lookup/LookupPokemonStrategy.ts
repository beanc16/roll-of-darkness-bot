import { ChatInputCommandInteraction } from 'discord.js';

import { ChatIteractionStrategy } from '../../ChatIteractionStrategy.js';
import { staticImplements } from '../../../../decorators/staticImplements.js';
import { PtuLookupSubcommand } from '../../../options/subcommand-groups/ptu/lookup.js';

import { getLookupPokemonEmbedMessages } from '../../../embed-messages/ptu/lookup.js';
import { BaseLookupRespondStrategy } from './BaseLookupRespondStrategy.js';
import { PokemonController } from '../../../../dal/PtuController.js';
import { PtuPokemon } from '../../../../types/pokemon.js';

export interface GetLookupPokemonDataParameters
{
    name?: string | null;
}

@staticImplements<ChatIteractionStrategy>()
export class LookupPokemonStrategy
{
    public static key = PtuLookupSubcommand.Pokemon;

    static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString('pokemon_name', true);

        const pokemon = await this.getLookupData({
            name,
        });

        // TODO: Add listview and final paginated functionality later

        // Get message
        const embeds = getLookupPokemonEmbedMessages(pokemon);

        return await BaseLookupRespondStrategy.run(interaction, embeds, {
            noEmbedsErrorMessage: 'No pokemon were found.',
        });
    }

    private static async getLookupData({
        name,
    }: GetLookupPokemonDataParameters = {})
    {
        if (!name)
        {
            return [];
        }

        const { results = [] } = await PokemonController.getAll({
            name: new RegExp(name, 'i'),
        });
        const pokemon = results as PtuPokemon[];

        // Sort by name
        pokemon.sort((a, b) =>
        {
            return a.name.localeCompare(b.name);
        });

        return pokemon;
    }
}
