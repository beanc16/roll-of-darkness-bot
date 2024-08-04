import { ChatInputCommandInteraction } from 'discord.js';

export type SubcommandHandlerFunction = (interaction: ChatInputCommandInteraction) => Promise<boolean>;
