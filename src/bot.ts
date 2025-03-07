import process from 'node:process';

import { Client, GatewayIntentBits } from 'discord.js';

import events, { nodejsProcessEvents } from './events/index.js';

// Initialize Discord Bot
const bot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
    ],
});
await bot.login(process.env.TOKEN);

events.forEach((event) =>
{
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- Allow the parameters to be any since that's what the library gives us
    // @ts-ignore
    bot.on(event.name as string, (...params) => event.handler(bot, ...params)); // eslint-disable-line @typescript-eslint/no-unsafe-argument
});

process.on('uncaughtException', (error) => nodejsProcessEvents.handleError('uncaughtException', error));
process.on('unhandledRejection', (reason) => nodejsProcessEvents.handleError('unhandledRejection', reason));
process.on('SIGINT', () => nodejsProcessEvents.endProcess(bot));
process.on('SIGTERM', () => nodejsProcessEvents.endProcess(bot));
