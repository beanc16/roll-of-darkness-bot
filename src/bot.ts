// Environment Variables (add back in if Doppler stops working)
// import dotenv from 'dotenv';
// dotenv.config();

// Libraries
import { Client, GatewayIntentBits } from 'discord.js';

// Events to listen for
import events from './events/index.js';

// Initialize Discord Bot
const bot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
    ],
});
await bot.login(process.env.TOKEN);

events.forEach((event) =>
{
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- Allow the parameters to be any since that's what the library gives us
    // @ts-ignore
    bot.on(event.name as string, (...params) => event.handler(bot, ...params)); // eslint-disable-line @typescript-eslint/no-unsafe-argument
});
