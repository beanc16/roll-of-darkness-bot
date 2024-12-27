import { SlashCommandSubcommandBuilder } from 'discord.js';

export enum AdminSubcommand
{
    RefreshCache = 'refresh_cache',
}

export const refreshCache = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(AdminSubcommand.RefreshCache);
    subcommand.setDescription('Pull fresh data for the given command rather than using what was pulled on startup.');

    subcommand.addStringOption((option) =>
    {
        option.setName('command');
        option.setDescription('The command to refresh the cache for.');
        option.setRequired(true);
        return option.setAutocomplete(true);
    });

    return subcommand;
};
