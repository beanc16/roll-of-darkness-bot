import { SlashCommandStringOption, SlashCommandSubcommandBuilder } from 'discord.js';

export enum VcSubcommand
{
    Connect = 'connect',
    DeleteFile = 'delete_file',
    Disconnect = 'disconnect',
    Pause = 'pause',
    Play = 'play',
    Stop = 'stop',
    Unpause = 'unpause',
    ViewFiles = 'view_files',
}

const fileNameParameter = (option: SlashCommandStringOption): SlashCommandStringOption =>
{
    option.setName('file_name');
    option.setDescription('The name of the file.');
    option.setRequired(true);

    return option;
};

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

export const viewFiles = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(VcSubcommand.ViewFiles);
    subcommand.setDescription(`View files that you've uploaded.`);

    return subcommand;
};
