import { EmbedBuilder } from 'discord.js';

import { PtuFakemonCollection } from '../../../dal/models/PtuFakemonCollection.js';
import { getLookupPokemonEmbedMessages } from '../../../embed-messages/lookup.js';
import { PtuPokemon } from '../../../types/pokemon.js';

export class FakemonDiffEmbedMessage extends EmbedBuilder
{
    constructor(
        diff: Partial<PtuPokemon>,
        requiredPokemonInfo: Pick<PtuPokemon, 'name' | 'metadata'>,
        fakemonStatus: PtuFakemonCollection['status'],
    )
    {
        const { imageUrl: _, ...metadata } = requiredPokemonInfo.metadata;
        const [embed] = getLookupPokemonEmbedMessages([{
            ...requiredPokemonInfo,
            metadata,
            ...diff,
        }], {});
        super(embed.data);
        this.setFooter({ text: `Status: ${fakemonStatus}` });
    }
}
