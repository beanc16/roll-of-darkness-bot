import { EmbedBuilder } from 'discord.js';

import type { PtuFakemonCollection } from '../../../dal/models/PtuFakemonCollection.js';
import { getLookupPokemonEmbedMessages } from '../../../embed-messages/lookup.js';
import { HomebrewPokeApi } from '../../../services/HomebrewPokeApi/HomebrewPokeApi.js';

export class FakemonOverviewEmbedMessage extends EmbedBuilder
{
    constructor(fakemon: Omit<PtuFakemonCollection, 'versionName' | 'olderVersions'>)
    {
        const [embed] = getLookupPokemonEmbedMessages([{
            ...fakemon,
            metadata: {
                imageUrl: HomebrewPokeApi.unknownPokemonUrl,
                ...fakemon.metadata,
            },
        }], {});
        super(embed.data);
        this.setFooter({ text: `Status: ${fakemon.status}` });
    }
}
