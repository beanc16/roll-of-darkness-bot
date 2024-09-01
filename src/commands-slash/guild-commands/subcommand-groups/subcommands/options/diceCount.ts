import { SlashCommandIntegerOption } from 'discord.js';

export function diceCount(option: SlashCommandIntegerOption)
{
    option.setName('dice_count');
    option.setDescription('The minimum number of dice to use the flavor text (default: 0)');
    return option;
}
