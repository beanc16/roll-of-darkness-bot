import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

import { BaseStrategy } from '../../../strategies/BaseStrategy.js';

export interface PtuRandomPickupSubcommandResponse
{
    options: {
        embeds: EmbedBuilder[];
    };
    commandName: string;
}

export type PtuRandomPickupSubcommandStrategy = BaseStrategy<
    ChatInputCommandInteraction,
    Promise<boolean | PtuRandomPickupSubcommandResponse>
>;;
