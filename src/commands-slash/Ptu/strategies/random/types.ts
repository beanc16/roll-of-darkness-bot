import type { EmbedBuilder } from 'discord.js';

import type { CommandName } from '../../../../types/discord.js';
import type { PtuChatIteractionStrategy } from '../../types/strategies.js';

export interface PtuRandomPickupSubcommandResponse
{
    options: {
        embeds: EmbedBuilder[];
    };
    commandName: CommandName;
}

export type PtuRandomPickupSubcommandStrategy = PtuChatIteractionStrategy<boolean | PtuRandomPickupSubcommandResponse, boolean>;
