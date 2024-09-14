import { SlashCommandSubcommandGroupBuilder } from 'discord.js';
import * as lookupSubcommands from './lookup.js';
import * as randomSubcommands from './random.js';

export enum PtuSubcommandGroup
{
    Lookup = 'lookup',
    Random = 'random',
}

export const lookup = (subcommandGroup: SlashCommandSubcommandGroupBuilder) =>
{
    subcommandGroup.setName(PtuSubcommandGroup.Lookup);
    subcommandGroup.setDescription('Run PTU lookup commands.');
    Object.values(lookupSubcommands).forEach(lookupSubcommand => 
    {
        if (typeof lookupSubcommand === 'function')
        {
            subcommandGroup.addSubcommand(lookupSubcommand);
        }
    });
    return subcommandGroup;
};

export const random = (subcommandGroup: SlashCommandSubcommandGroupBuilder) =>
{
    subcommandGroup.setName(PtuSubcommandGroup.Random);
    subcommandGroup.setDescription('Run PTU randomization commands.');
    Object.values(randomSubcommands).forEach(randomSubcommand => 
    {
        if (typeof randomSubcommand === 'function')
        {
            subcommandGroup.addSubcommand(randomSubcommand);
        }
    });
    return subcommandGroup;
};
