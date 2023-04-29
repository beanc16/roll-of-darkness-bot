const { Events } = require('discord.js');
const { logger } = require("@beanc16/logger");
const SlashCommandsContainer = require('../slash-command-helpers/SlashCommandsContainer');



async function handler(bot, interaction)
{
	if (!interaction.isChatInputCommand()) return;

	const slashCommand = SlashCommandsContainer.getCommand(interaction.commandName);
	if (!slashCommand)
	{
		logger.error(`No command named ${interaction.commandName} was found.`);
		return;
	}

	try
	{
		await slashCommand.run(interaction);
	}
	catch (err)
	{
		logger.error(err);
		await interaction.reply({
			content: 'An error occurred while executing this command',
			ephemeral: true,
		});
	}
}



module.exports = {
    name: Events.InteractionCreate,
    handler,
};
