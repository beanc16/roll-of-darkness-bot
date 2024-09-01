import { SlashCommandStringOption } from 'discord.js';

export function category(option: SlashCommandStringOption)
{
    option.setName('category');
    option.setDescription('The name of the category');
    option.setRequired(true);
    return option;
}
