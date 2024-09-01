import { SlashCommandStringOption, SlashCommandUserOption } from 'discord.js';

export function friend(option: SlashCommandUserOption)
{
    option.setName('friend');
    option.setDescription(`A person to say you're giving a beat to.`);
    option.setRequired(true);
    return option;
}

export function reason(option: SlashCommandStringOption)
{
    option.setName('reason');
    option.setDescription(`Why you're giving a beat to this person.`);
    return option;
}
