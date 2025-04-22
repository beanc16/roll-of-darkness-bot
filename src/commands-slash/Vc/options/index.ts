import type { SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder } from 'discord.js';

import * as queueSubcommands from './queue.js';
import { fileNameParameter, shouldLoop } from './vcParameters.js';

export enum VcSubcommandGroup
{
    Queue = 'queue',
}

export enum VcSubcommand
{
    // TODO: Add the commented out subcommands later
    Connect = 'connect',
    DeleteFile = 'delete_file',
    Disconnect = 'disconnect',
    Load = 'load',
    Next = 'next',
    Pause = 'pause',
    Previous = 'previous',
    Play = 'play',
    RenameFile = 'rename_file',
    Stop = 'stop',
    Unpause = 'unpause',
    Upload = 'upload_file',
    ViewFiles = 'view_files',
}

export const connect = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(VcSubcommand.Connect);
    subcommand.setDescription('Connect to a voice channel to play audio.');

    return subcommand;
};

export const deleteFile = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(VcSubcommand.DeleteFile);
    subcommand.setDescription(`Delete a file that you've uploaded.`);

    subcommand.addStringOption(fileNameParameter);

    return subcommand;
};

export const disconnect = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(VcSubcommand.Disconnect);
    subcommand.setDescription('Disconnect from a voice channel.');

    return subcommand;
};

export const load = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(VcSubcommand.Load);
    subcommand.setDescription('Pre-Buffer audio so it can be played with less delay.');

    subcommand.addStringOption(fileNameParameter);

    return subcommand;
};

export const next = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(VcSubcommand.Next);
    subcommand.setDescription('Play the next audio file in the queue.');

    return subcommand;
};

export const pause = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(VcSubcommand.Pause);
    subcommand.setDescription('Pause audio in your voice channel.');

    return subcommand;
};

export const play = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(VcSubcommand.Play);
    subcommand.setDescription('Play audio in your voice channel.');

    subcommand.addStringOption(fileNameParameter);
    subcommand.addBooleanOption(shouldLoop);

    return subcommand;
};

export const previous = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(VcSubcommand.Previous);
    subcommand.setDescription('Play the previous audio file in the queue.');

    return subcommand;
};

export const queue = (subcommandGroup: SlashCommandSubcommandGroupBuilder): SlashCommandSubcommandGroupBuilder =>
{
    subcommandGroup.setName(VcSubcommandGroup.Queue);
    subcommandGroup.setDescription('Run VC queue commands.');
    Object.values(queueSubcommands).forEach((subcommand) =>
    {
        if (typeof subcommand === 'function')
        {
            subcommandGroup.addSubcommand(subcommand);
        }
    });
    return subcommandGroup;
};

export const renameFile = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(VcSubcommand.RenameFile);
    subcommand.setDescription(`Rename a file that you've uploaded.`);

    subcommand.addStringOption((option) =>
    {
        option.setName('old_file_name');
        option.setDescription('The old name of the file.');
        return option.setRequired(true);
    });
    subcommand.addStringOption((option) =>
    {
        option.setName('new_file_name');
        option.setDescription('The new name of the file.');
        return option.setRequired(true);
    });

    return subcommand;
};

export const stop = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(VcSubcommand.Stop);
    subcommand.setDescription('Stop playing audio in your voice channel.');

    return subcommand;
};

export const unpause = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(VcSubcommand.Unpause);
    subcommand.setDescription('Unpause audio in your voice channel.');

    return subcommand;
};

export const upload = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(VcSubcommand.Upload);
    subcommand.setDescription(`Upload an audio file.`);

    subcommand.addStringOption(fileNameParameter);
    subcommand.addAttachmentOption((option) =>
    {
        option.setName('file');
        return option.setDescription('An audio file. This will take precedence over file_url.');
    });
    subcommand.addStringOption((option) =>
    {
        option.setName('file_url');
        return option.setDescription('The URL of the file.');
    });

    return subcommand;
};

export const viewFiles = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(VcSubcommand.ViewFiles);
    subcommand.setDescription(`View files that you've uploaded.`);

    return subcommand;
};
