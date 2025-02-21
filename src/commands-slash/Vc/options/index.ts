import { SlashCommandSubcommandBuilder } from 'discord.js';

export enum VcSubcommand
{
    Connect = 'connect',
}

export const connect = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(VcSubcommand.Connect);
    subcommand.setDescription('Connect to a voice channel to play audio.');

    return subcommand;
};
