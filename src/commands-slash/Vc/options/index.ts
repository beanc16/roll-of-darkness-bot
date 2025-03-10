import type { SlashCommandStringOption, SlashCommandSubcommandBuilder } from 'discord.js';

export enum VcSubcommand
{
    Connect = 'connect',
    DeleteFile = 'delete_file',
    Disconnect = 'disconnect',
    Load = 'load',
    Pause = 'pause',
    Play = 'play',
    RenameFile = 'rename_file',
    Stop = 'stop',
    Unpause = 'unpause',
    Upload = 'upload_file',
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

export const load = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(VcSubcommand.Load);
    subcommand.setDescription('Pre-Buffer audio so it can be played with less delay.');

    subcommand.addStringOption(fileNameParameter);

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
    subcommand.addBooleanOption((option) =>
    {
        option.setName('should_loop');
        return option.setDescription('Should loop the audio (default: False).');
    });

    return subcommand;
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
