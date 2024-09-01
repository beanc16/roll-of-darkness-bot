import { SlashCommandIntegerOption } from 'discord.js';

export function desiredNumberOfSuccesses(option: SlashCommandIntegerOption)
{
    option.setName('desired_number_of_successes');
    option.setDescription('The desired number of successes to roll');
    option.setMinValue(0);
    option.setMaxValue(50);
    option.setRequired(true);
    return option;
}
