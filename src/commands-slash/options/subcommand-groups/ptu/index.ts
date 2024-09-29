import { APIApplicationCommandOptionChoice, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder } from 'discord.js';
import * as lookupSubcommands from './lookup.js';
import * as randomSubcommands from './random.js';

export enum PtuSubcommandGroup
{
    Lookup = 'lookup',
    QuickReference = 'quick_reference',
    Random = 'random',
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
    Object.values(randomSubcommands).forEach(randomSubcommand => 
    {
        if (typeof randomSubcommand === 'function')
        {
            subcommandGroup.addSubcommand(randomSubcommand);
        }
    });
    return subcommandGroup;
};
