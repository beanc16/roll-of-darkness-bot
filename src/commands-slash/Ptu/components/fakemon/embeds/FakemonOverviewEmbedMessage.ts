import { EmbedBuilder } from 'discord.js';

import { getLookupPokemonEmbedMessages } from '../../../embed-messages/lookup.js';
import { PtuPokemon } from '../../../types/pokemon.js';

export class FakemonOverviewEmbedMessage extends EmbedBuilder
{
    constructor(pokemon: Omit<PtuPokemon, 'versionName' | 'olderVersions'>)
    {
        const [embed] = getLookupPokemonEmbedMessages([pokemon], {});
        super(embed.data);
    }
}
