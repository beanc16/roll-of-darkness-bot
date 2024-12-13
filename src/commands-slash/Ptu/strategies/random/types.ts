import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

import { CommandName } from '../../../../types/discord.js';
import { BaseStrategy } from '../../../strategies/types/BaseStrategy.js';

export interface PtuRandomPickupSubcommandResponse
{
    options: {
        embeds: EmbedBuilder[];
    };
    commandName: CommandName;
}

export type PtuRandomPickupSubcommandStrategy = BaseStrategy<
    ChatInputCommandInteraction,
    Promise<boolean | PtuRandomPickupSubcommandResponse>
>;
