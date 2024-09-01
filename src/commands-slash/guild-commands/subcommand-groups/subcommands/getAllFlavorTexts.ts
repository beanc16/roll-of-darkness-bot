import { SlashCommandSubcommandBuilder } from 'discord.js';

export function getAllFlavorTexts(subcommand: SlashCommandSubcommandBuilder)
{
    subcommand.setName('flavor_text');
    subcommand.setDescription('Get all flavor text');
    return subcommand;
}
