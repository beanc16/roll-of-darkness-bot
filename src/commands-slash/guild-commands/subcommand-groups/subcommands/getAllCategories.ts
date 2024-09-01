import { SlashCommandSubcommandBuilder } from 'discord.js';

export function getAllCategories(subcommand: SlashCommandSubcommandBuilder)
{
    subcommand.setName('category');
    subcommand.setDescription('Get all categories');
    return subcommand;
}
