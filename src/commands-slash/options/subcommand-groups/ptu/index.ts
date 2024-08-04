import { SlashCommandSubcommandGroupBuilder } from 'discord.js';
import * as lookupSubcommands from './lookup';
import * as randomSubcommands from './random';

export enum PtuSubcommandGroup
{
    Lookup = 'lookup',
    Random = 'random',
}

export const lookup = (subcommandGroup: SlashCommandSubcommandGroupBuilder) =>
{
    subcommandGroup.setName(PtuSubcommandGroup.Lookup);
    subcommandGroup.setDescription('Run PTU lookup commands.');
    subcommandGroup.addSubcommand(lookupSubcommands.ability);
    subcommandGroup.addSubcommand(lookupSubcommands.move);
    return subcommandGroup;
};

export const random = (subcommandGroup: SlashCommandSubcommandGroupBuilder) =>
{
    subcommandGroup.setName(PtuSubcommandGroup.Random);
    subcommandGroup.setDescription('Run PTU randomization commands.');
    subcommandGroup.addSubcommand(randomSubcommands.apricorn);
    subcommandGroup.addSubcommand(randomSubcommands.berry);
    subcommandGroup.addSubcommand(randomSubcommands.dowsingRod);
    subcommandGroup.addSubcommand(randomSubcommands.evolutionaryStone);
    subcommandGroup.addSubcommand(randomSubcommands.healingItem);
    subcommandGroup.addSubcommand(randomSubcommands.heldItem);
    subcommandGroup.addSubcommand(randomSubcommands.metronome);
    subcommandGroup.addSubcommand(randomSubcommands.pokeball);
    subcommandGroup.addSubcommand(randomSubcommands.pickup);
    subcommandGroup.addSubcommand(randomSubcommands.xItem);
    subcommandGroup.addSubcommand(randomSubcommands.tm);
    subcommandGroup.addSubcommand(randomSubcommands.vitamin);
    return subcommandGroup;
};
