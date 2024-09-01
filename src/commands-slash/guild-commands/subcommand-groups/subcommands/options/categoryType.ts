import { SlashCommandStringOption } from 'discord.js';

export function categoryType(option: SlashCommandStringOption)
{
    option.setName('category_type');
    option.setDescription('The type of the category');
    option.setRequired(true);
    return option;
}
