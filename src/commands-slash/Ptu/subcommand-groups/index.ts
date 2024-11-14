import {
    APIApplicationCommandOptionChoice,
    SlashCommandSubcommandBuilder,
    SlashCommandSubcommandGroupBuilder,
} from 'discord.js';

import { PtuCharacterSheetName } from '../types/sheets.js';
import * as calculateSubcommands from './calculate.js';
import * as lookupSubcommands from './lookup.js';
import * as randomSubcommands from './random.js';
import * as rollSubcommands from './roll.js';

export enum PtuSubcommandGroup
{
    Calculate = 'calculate',
    Lookup = 'lookup',
    QuickReference = 'quick_reference',
    Random = 'random',
    Roll = 'roll',
    Train = 'train',
}

export enum PtuQuickReferenceInfo
{
    DamageCharts = 'damage_charts',
    NatureChart = 'nature_chart',
    PokemonExperienceChart = 'pokemon_experience_chart',
    PowerChart = 'power_chart',
    SwitchingPokemon = 'switching_pokemon',
    TrainingPokemon = 'training_pokemon',
    WeightClassChart = 'weight_class_chart',
    TypeChart = 'type_chart',
}

export const calculate = (subcommandGroup: SlashCommandSubcommandGroupBuilder): SlashCommandSubcommandGroupBuilder =>
{
    subcommandGroup.setName(PtuSubcommandGroup.Calculate);
    subcommandGroup.setDescription('Run PTU calculate commands.');
    Object.values(calculateSubcommands).forEach((subcommand) =>
    {
        if (typeof subcommand === 'function')
        {
            subcommandGroup.addSubcommand(subcommand);
        }
    });
    return subcommandGroup;
};

export const lookup = (subcommandGroup: SlashCommandSubcommandGroupBuilder): SlashCommandSubcommandGroupBuilder =>
{
    subcommandGroup.setName(PtuSubcommandGroup.Lookup);
    subcommandGroup.setDescription('Run PTU lookup commands.');
    Object.values(lookupSubcommands).forEach((subcommand) =>
    {
        if (typeof subcommand === 'function')
        {
            subcommandGroup.addSubcommand(subcommand);
        }
    });
    return subcommandGroup;
};

export const quickReference = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuSubcommandGroup.QuickReference);
    subcommand.setDescription('Get PTU quick reference information.');

    subcommand.addStringOption((option) =>
    {
        option.setName('reference_info');
        option.setDescription('The quick reference info to look up.');

        const choices = Object.values(PtuQuickReferenceInfo).map<APIApplicationCommandOptionChoice<string>>(
            (value) =>
            {
                const key = value
                    .split('_')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');

                return {
                    name: key,
                    value,
                };
            },
        );
        option.addChoices(...choices);
        return option.setRequired(true);
    });

    return subcommand;
};

export const random = (subcommandGroup: SlashCommandSubcommandGroupBuilder): SlashCommandSubcommandGroupBuilder =>
{
    subcommandGroup.setName(PtuSubcommandGroup.Random);
    subcommandGroup.setDescription('Run PTU randomization commands.');
    Object.values(randomSubcommands).forEach((subcommand) =>
    {
        if (typeof subcommand === 'function')
        {
            subcommandGroup.addSubcommand(subcommand);
        }
    });
    return subcommandGroup;
};

export const roll = (subcommandGroup: SlashCommandSubcommandGroupBuilder): SlashCommandSubcommandGroupBuilder =>
{
    subcommandGroup.setName(PtuSubcommandGroup.Roll);
    subcommandGroup.setDescription('Run PTU roll commands.');
    Object.values(rollSubcommands).forEach((subcommand) =>
    {
        if (typeof subcommand === 'function')
        {
            subcommandGroup.addSubcommand(subcommand);
        }
    });
    return subcommandGroup;
};

export const train = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuSubcommandGroup.Train);
    subcommand.setDescription('Train a pokemon on your character sheet.');

    subcommand.addStringOption((option) =>
    {
        option.setName('character_name');
        option.setDescription('The name of the character to train pokemon on.');

        const choices = Object.values(PtuCharacterSheetName).map<APIApplicationCommandOptionChoice<string>>(
            (name) =>
            {
                return {
                    name,
                    value: name,
                };
            },
        );
        option.addChoices(...choices);

        return option.setRequired(true);
    });

    subcommand.addStringOption((option) =>
    {
        option.setName('pokemon_page_name');
        option.setDescription(`The name of the pokemon's page in the spreadsheet.`);
        return option.setRequired(true);
    });

    subcommand.addIntegerOption((option) =>
    {
        option.setName('num_of_training_sessions');
        return option.setDescription('The number of training sessions for the pokemon (default: 1).');
    });

    subcommand.addIntegerOption((option) =>
    {
        option.setName('exp_per_training_session');
        return option.setDescription(`The experience to give per training session (default: whatever's on the sheet).`);
    });

    subcommand.addBooleanOption((option) =>
    {
        option.setName('should_use_baby_food');
        return option.setDescription(`Should increase the exp gain of the pokemon at level 15 or lower by 20% (default: false).`);
    });

    return subcommand;
};
