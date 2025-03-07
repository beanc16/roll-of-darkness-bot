// These are Node.js process events rather than Discord.js events
import process from 'node:process';

import { logger } from '@beanc16/logger';
import { Client } from 'discord.js';

import { VoiceConnectionTimeoutManager } from '../commands-slash/Vc/services/VoiceConnectionTimeoutManager.js';

export const handleError = (event: string, errorOrReason: unknown): void =>
{
    logger.error(`An unknown error occurred on ${event}`, errorOrReason);
};

export const endProcess = (bot: Client): void =>
{
    // Destroy all connections to voice channels
    VoiceConnectionTimeoutManager.destroyAllConnections();

    // Destroy the bot
    bot.destroy();

    // Exit the process
    process.exit();
};
