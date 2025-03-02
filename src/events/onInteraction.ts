import { logger } from '@beanc16/logger';
import {
    AutocompleteInteraction,
    Client,
    CommandInteraction,
    Events,
    ModalSubmitInteraction,
} from 'discord.js';

import { modalMap } from '../modals/index.js';
import { SlashCommandsContainer } from '../scripts/registerSlashCommands/SlashCommandsContainer.js';

async function handler(bot: Client, interaction: CommandInteraction | AutocompleteInteraction): Promise<void>
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
            logger.error(`An unknown error occurred while executing /${slashCommand.commandName}`, err);
            await interaction.followUp({
                content: 'An unknown error occurred while executing this command',
                ephemeral: true,
            });
        }
    }
    else if (interaction.isAutocomplete())
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
            await slashCommand.autocomplete(interaction);
        }
        catch (err)
        {
            logger.error(`An unknown error occurred while autocompleting /${slashCommand.commandName}`, err);
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
            logger.error(`An unknown error occurred while executing the context menu: ${contextMenuCommand.commandName}`, err);
            await interaction.followUp({
                content: 'An unknown error occurred while executing this command',
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
            logger.error(`An unknown error occurred while submitting the modal with id: ${Modal.id}, and title: ${Modal.title}`, err);
            await modalSubmitInteraction.followUp({
                content: 'An unknown error occurred while submitting this modal',
                ephemeral: true,
            });
        }
    }
}

export default {
    name: Events.InteractionCreate,
    handler,
};
