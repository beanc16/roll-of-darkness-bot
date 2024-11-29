import { SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder } from 'discord.js';

import * as initiativeOptions from './initiative.js';
import * as lookupSubcommands from './lookup.js';
import * as rollOptions from './roll.js';

export enum NwodSubcommandGroup
{
    Lookup = 'lookup',
}

export enum NwodSubcommand
{
    Roll = 'roll',
    Initiative = 'initiative',
    Chance = 'chance',
    Luck = 'luck',
}

export const chance = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(NwodSubcommand.Chance);
    subcommand.setDescription('Roll one d10 with no rerolls or modifiers.');

    subcommand.addStringOption(rollOptions.name);
    subcommand.addBooleanOption(rollOptions.secret);

    return subcommand;
};

export const initiative = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(NwodSubcommand.Initiative);
    subcommand.setDescription('Roll one d10 with no rerolls to determine initiative order.');

    subcommand.addStringOption(initiativeOptions.initiativeModifier);
    subcommand.addStringOption(rollOptions.name);
    subcommand.addBooleanOption(rollOptions.secret);

    return subcommand;
};

export const lookup = (subcommandGroup: SlashCommandSubcommandGroupBuilder): SlashCommandSubcommandGroupBuilder =>
{
    subcommandGroup.setName(NwodSubcommandGroup.Lookup);
    subcommandGroup.setDescription('Run nWOD lookup commands.');
    Object.values(lookupSubcommands).forEach((subcommand) =>
    {
        if (typeof subcommand === 'function')
        {
            subcommandGroup.addSubcommand(subcommand);
        }
    });
    return subcommandGroup;
};

export const luck = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(NwodSubcommand.Luck);
    subcommand.setDescription('Roll three d10s with no extra modifiers.');

    subcommand.addStringOption(rollOptions.name);
    subcommand.addBooleanOption(rollOptions.secret);

    return subcommand;
};

export const roll = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(NwodSubcommand.Roll);
    subcommand.setDescription('Roll a dice pool of d10s with math (only addition and subtraction are supported; IE: 5 - 10).');

    subcommand.addStringOption(rollOptions.numberOfDice);
    subcommand.addStringOption(rollOptions.name);
    subcommand.addStringOption(rollOptions.rerolls);
    subcommand.addBooleanOption(rollOptions.rote);
    subcommand.addIntegerOption(rollOptions.exceptionalOn);
    subcommand.addIntegerOption(rollOptions.diceToReroll);
    subcommand.addIntegerOption(rollOptions.extraSuccesses);
    subcommand.addBooleanOption(rollOptions.advancedAction);
    subcommand.addBooleanOption(rollOptions.secret);

    return subcommand;
};
