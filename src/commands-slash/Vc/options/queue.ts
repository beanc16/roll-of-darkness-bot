import { SlashCommandSubcommandBuilder } from 'discord.js';

import {
    fileNameParameter,
    queuePosition,
    shouldLoop,
} from './vcParameters.js';

export enum VcQueueSubcommand
{
    Add = 'add',
    Clear = 'clear',
    Remove = 'remove',
    Update = 'update',
    UpdateSettings = 'update_settings',
    View = 'view',
}

export const add = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(VcQueueSubcommand.Add);
    subcommand.setDescription('Add an audio file to the queue.');

    subcommand.addStringOption(fileNameParameter);
    subcommand.addBooleanOption(shouldLoop);
    subcommand.addStringOption(queuePosition);

    return subcommand;
};

export const clear = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(VcQueueSubcommand.Clear);
    subcommand.setDescription('Clear all audio files from the queue.');

    return subcommand;
};

export const updateSettings = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(VcQueueSubcommand.UpdateSettings);
    subcommand.setDescription(`Set whether the queue should loop back to the first track when the last track finishes playing.`);

    subcommand.addBooleanOption((option) =>
    {
        const newOption = shouldLoop(option);
        return newOption.setRequired(true);
    });

    return subcommand;
};

export const remove = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(VcQueueSubcommand.Remove);
    subcommand.setDescription('Remove an audio file from the queue.');

    subcommand.addStringOption(fileNameParameter);

    return subcommand;
};

export const update = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(VcQueueSubcommand.Update);
    subcommand.setDescription('Update an audio file in the queue.');

    subcommand.addStringOption(fileNameParameter);
    subcommand.addBooleanOption(shouldLoop);
    subcommand.addStringOption(queuePosition);

    return subcommand;
};

export const view = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(VcQueueSubcommand.View);
    subcommand.setDescription(`View files in the queue.`);
    return subcommand;
};
