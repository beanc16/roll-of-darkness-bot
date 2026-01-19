import { EmbedBuilder } from 'discord.js';

import { getLookupPokemonEmbedMessages } from '../../../embed-messages/lookup.js';
import { HomebrewPokeApi } from '../../../services/HomebrewPokeApi/HomebrewPokeApi.js';
import { PtuPokemon } from '../../../types/pokemon.js';

export class FakemonOverviewEmbedMessage extends EmbedBuilder
{
    constructor(pokemon: Omit<PtuPokemon, 'versionName' | 'olderVersions'>)
    {
        const [embed] = getLookupPokemonEmbedMessages([{
            ...pokemon,
            metadata: {
                imageUrl: HomebrewPokeApi.unknownPokemonUrl,
                ...pokemon.metadata,
            },
        }], {});
        super(embed.data);
    }
}
