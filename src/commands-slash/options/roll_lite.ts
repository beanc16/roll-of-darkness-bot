import { SlashCommandStringOption } from 'discord.js';

export function dicePool(option: SlashCommandStringOption): SlashCommandStringOption
{
    option.setName('dice_pool');
    option.setDescription('A mathematical formula of dice to roll (only addition and subtraction are supported; IE: 2d6 + 3d4)');
    option.setMinLength(1);
    option.setRequired(true);
    return option;
}
