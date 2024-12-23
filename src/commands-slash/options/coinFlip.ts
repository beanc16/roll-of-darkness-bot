import { SlashCommandStringOption } from 'discord.js';

export function headsOrTails(option: SlashCommandStringOption): SlashCommandStringOption
{
    option.setName('heads_or_tails');
    option.setDescription('The face that you would like to get in the coin flip');
    option.addChoices(
        {
            name: 'Heads',
            value: 'heads',
        },
        {
            name: 'Tails',
            value: 'tails',
        },
    );
    option.setRequired(true);
    return option;
}
