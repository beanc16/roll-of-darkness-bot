// Env variables
require('dotenv').config();

// Libraries
const {
	Client,
	GatewayIntentBits,
} = require('discord.js');

// Events to listen for
const events = require('./events');

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
	bot.on(event.name, (...params) => event.handler(bot, ...params));
});
