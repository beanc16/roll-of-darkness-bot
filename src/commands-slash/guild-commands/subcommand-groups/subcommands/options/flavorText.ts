import { SlashCommandStringOption } from 'discord.js';

export function flavorText(option: SlashCommandStringOption)
{
    option.setName('flavor_text');
    option.setDescription('The text to display when the given categories are met');
    option.setRequired(true);
    return option;
}
