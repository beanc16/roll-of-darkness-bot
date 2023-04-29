const { Events } = require('discord.js');
const { logger } = require("@beanc16/logger");

function handler()
{
	const devStr = (process.env.STAGE && process.env.STAGE === "dev")
		? "-dev"
		: "";

	logger.info(`${process.env.APPLICATION_NAME}${devStr} has connected.`);
}



module.exports = {
    name: Events.ClientReady,
    handler,
};
