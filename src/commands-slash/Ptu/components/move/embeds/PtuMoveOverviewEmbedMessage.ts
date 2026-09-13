import { EmbedBuilder } from 'discord.js';

import { PtuMoveCollection } from '../../../dal/models/PtuMoveCollection.js';
import { getLookupMovesEmbedMessages } from '../../../embed-messages/lookup.js';
import { PtuMoveCollectionToPtuAdapter } from '../../../services/MoveDataManagers/PtuMoveCollectionToPtuAdapter.js';

export class PtuMoveOverviewEmbedMessage extends EmbedBuilder
{
    constructor(move: Omit<PtuMoveCollection, 'versionName' | 'olderVersions'>)
    {
        // Transform data
        const adapter = new PtuMoveCollectionToPtuAdapter();
        const transformedMove = adapter.transform(move);

        // Set embed
        const [embed] = getLookupMovesEmbedMessages([transformedMove], {});
        super(embed.data);
        this.setFooter({ text: `Status: ${move.status}` });
    }
}
