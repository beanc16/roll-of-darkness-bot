import { SlashCommandSubcommandBuilder } from 'discord.js';

import {
    fileNameParameter,
    queuePosition,
    shouldLoop,
} from './vcParameters.js';

export enum VcQueueSubcommand
{
    // TODO: Add these subcommands later
    View = 'view',
    Add = 'add',
    Remove = 'remove',
    // Clear = 'clear',
    // Loop = 'loop',
    // LoopTrack = 'loop_track',
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

export const remove = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(VcQueueSubcommand.Remove);
    subcommand.setDescription('Remove an audio file from the queue.');

    subcommand.addStringOption(fileNameParameter);

    return subcommand;
};

export const view = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(VcQueueSubcommand.View);
    subcommand.setDescription(`View files in the queue.`);
    return subcommand;
};
