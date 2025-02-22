import { SlashCommandSubcommandBuilder } from 'discord.js';

export enum VcSubcommand
{
    Connect = 'connect',
    Disconnect = 'disconnect',
    Play = 'play',
    Stop = 'stop',
}

export const connect = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(VcSubcommand.Connect);
    subcommand.setDescription('Connect to a voice channel to play audio.');

    return subcommand;
};

export const disconnect = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(VcSubcommand.Disconnect);
    subcommand.setDescription('Disconnect from a voice channel.');

    return subcommand;
};

export const play = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(VcSubcommand.Play);
    subcommand.setDescription('Play audio in your voice channel.');

    return subcommand;
};

export const stop = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(VcSubcommand.Stop);
    subcommand.setDescription('Stop playing audio in your voice channel.');

    return subcommand;
};
