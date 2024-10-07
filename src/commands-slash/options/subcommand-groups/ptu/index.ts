import { APIApplicationCommandOptionChoice, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder } from 'discord.js';
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

export const calculate = (subcommandGroup: SlashCommandSubcommandGroupBuilder) =>
{
    subcommandGroup.setName(PtuSubcommandGroup.Calculate);
    subcommandGroup.setDescription('Run PTU calculate commands.');
    Object.values(calculateSubcommands).forEach(subcommand => 
    {
        if (typeof subcommand === 'function')
        {
            subcommandGroup.addSubcommand(subcommand);
        }
    });
    return subcommandGroup;
};

export const lookup = (subcommandGroup: SlashCommandSubcommandGroupBuilder) =>
{
    subcommandGroup.setName(PtuSubcommandGroup.Lookup);
    subcommandGroup.setDescription('Run PTU lookup commands.');
    Object.values(lookupSubcommands).forEach(subcommand => 
    {
        if (typeof subcommand === 'function')
        {
            subcommandGroup.addSubcommand(subcommand);
        }
    });
    return subcommandGroup;
};

export const quickReference = (subcommand: SlashCommandSubcommandBuilder) =>
{
    subcommand.setName(PtuSubcommandGroup.QuickReference);
    subcommand.setDescription('Get PTU quick reference information.');

    subcommand.addStringOption((option) => {
        option.setName('reference_info');
        option.setDescription('The quick reference info to look up.');

        const choices = Object.values(PtuQuickReferenceInfo).map<APIApplicationCommandOptionChoice<string>>(
            (value) => {
                const key = value
                    .split('_')
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');

                return {
                    name: key,
                    value: value,
                };
            }
        );
        option.addChoices(...choices);
        return option.setRequired(true);
    });

    return subcommand;
};

export const random = (subcommandGroup: SlashCommandSubcommandGroupBuilder) =>
{
    subcommandGroup.setName(PtuSubcommandGroup.Random);
    subcommandGroup.setDescription('Run PTU randomization commands.');
    Object.values(randomSubcommands).forEach(subcommand => 
    {
        if (typeof subcommand === 'function')
        {
            subcommandGroup.addSubcommand(subcommand);
        }
    });
    return subcommandGroup;
};

export const roll = (subcommandGroup: SlashCommandSubcommandGroupBuilder) =>
{
    subcommandGroup.setName(PtuSubcommandGroup.Roll);
    subcommandGroup.setDescription('Run PTU roll commands.');
    Object.values(rollSubcommands).forEach(subcommand => 
    {
        if (typeof subcommand === 'function')
        {
            subcommandGroup.addSubcommand(subcommand);
        }
    });
    return subcommandGroup;
};
