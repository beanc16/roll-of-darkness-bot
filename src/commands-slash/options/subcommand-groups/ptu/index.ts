import { SlashCommandSubcommandGroupBuilder } from 'discord.js';
import * as lookupSubcommands from './lookup.js';
import * as quickReferenceSubcommands from './quickReference.js';
import * as randomSubcommands from './random.js';

export enum PtuSubcommandGroup
{
    Lookup = 'lookup',
    QuickReference = 'quick_reference',
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

export const quickReference = (subcommandGroup: SlashCommandSubcommandGroupBuilder) =>
{
    subcommandGroup.setName(PtuSubcommandGroup.QuickReference);
    subcommandGroup.setDescription('Run PTU quick reference commands.');
    Object.values(quickReferenceSubcommands).forEach(quickReferenceSubcommand => 
    {
        if (typeof quickReferenceSubcommand === 'function')
        {
            subcommandGroup.addSubcommand(quickReferenceSubcommand);
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
