import { SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder } from 'discord.js';

import * as sharedOptions from '../../options/shared.js';
import * as lookupSubcommands from './lookup.js';
import * as rollOptions from './roll.js';

export enum CurseborneSubcommandGroup
{
    Lookup = 'lookup',
}

export enum CurseborneSubcommand
{
    Roll = 'roll',
}

export type CurseborneAllNestedSubcommands = lookupSubcommands.CurseborneLookupSubcommand;

export const lookup = (subcommandGroup: SlashCommandSubcommandGroupBuilder): SlashCommandSubcommandGroupBuilder =>
{
    subcommandGroup.setName(CurseborneSubcommandGroup.Lookup);
    subcommandGroup.setDescription('Run Cursebourne lookup commands.');
    Object.values(lookupSubcommands).forEach((subcommand) =>
    {
        if (typeof subcommand === 'function')
        {
            subcommandGroup.addSubcommand(subcommand);
        }
    });
    return subcommandGroup;
};

export const roll = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(CurseborneSubcommand.Roll);
    subcommand.setDescription('Run d10s following Cursebourne rules.');

    subcommand.addIntegerOption(sharedOptions.numberOfDice);
    subcommand.addStringOption(rollOptions.name);
    subcommand.addIntegerOption(rollOptions.cursedDice);
    subcommand.addIntegerOption(rollOptions.enhancements);
    subcommand.addStringOption(rollOptions.twoSuccesses);
    subcommand.addBooleanOption(rollOptions.secret);

    return subcommand;
};
