import dotenv from 'dotenv';
dotenv.config();

// Libraries
import {
    Client,
    GatewayIntentBits,
} from 'discord.js';

// Events to listen for
import events from './events';

// Initialize Discord Bot
const bot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
    ],
});
bot.login(process.env.TOKEN);

events.forEach(function (event)
{
    // @ts-ignore
    bot.on(event.name as string, (...params) => event.handler(bot, ...params));
});
