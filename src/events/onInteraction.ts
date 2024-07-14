import { Client, CommandInteraction, Events, ModalSubmitInteraction } from 'discord.js';
import { logger } from '@beanc16/logger';
import { SlashCommandsContainer } from '../slash-command-helpers/SlashCommandsContainer';
import { modalMap } from '../modals';



async function handler(bot: Client, interaction: CommandInteraction)
{
	if (interaction.isChatInputCommand())
	{
		const slashCommand = SlashCommandsContainer.getCommand(interaction.commandName)
			|| SlashCommandsContainer.getGuildCommand(interaction.commandName);
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
	else if (interaction.isMessageContextMenuCommand())
	{
		const contextMenuCommand = SlashCommandsContainer.getContextMenuCommand(interaction.commandName);
		if (!contextMenuCommand)
		{
			logger.error(`No command named ${interaction.commandName} was found.`);
			return;
		}

		try
		{
			await contextMenuCommand.run(bot, interaction);
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
	else if (interaction.isModalSubmit())
	{
		const modalSubmitInteraction = interaction as ModalSubmitInteraction;
		const Modal = modalMap[modalSubmitInteraction.customId];

		if (!Modal)
		{
			logger.error(`No modal with an id of ${modalSubmitInteraction.customId} was found.`);
			return;
		}

		try
		{
			await Modal.run(interaction);
		}
		catch (err)
		{
			logger.error(err);
			await modalSubmitInteraction.reply({
				content: 'An error occurred while submitting this modal',
				ephemeral: true,
			});
		}
	}
}



export default {
    name: Events.InteractionCreate,
    handler,
};
