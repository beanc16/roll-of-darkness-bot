import { SlashCommandSubcommandBuilder } from 'discord.js';

export enum PtuQuickReferenceSubcommand
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

export const damageCharts = (subcommand: SlashCommandSubcommandBuilder) =>
{
    subcommand.setName(PtuQuickReferenceSubcommand.DamageCharts);
    subcommand.setDescription('Get charts showing the damage associated with each damage base (DB).');

    return subcommand;
};

export const natureChart = (subcommand: SlashCommandSubcommandBuilder) =>
{
    subcommand.setName(PtuQuickReferenceSubcommand.NatureChart);
    subcommand.setDescription(`Get a chart showing the stats that're raised and lowered for each nature.`);

    return subcommand;
};

export const pokemonExperienceChart = (subcommand: SlashCommandSubcommandBuilder) =>
{
    subcommand.setName(PtuQuickReferenceSubcommand.PokemonExperienceChart);
    subcommand.setDescription(`Get a chart showing the experience needed to reach each pokemon level.`);

    return subcommand;
};

export const powerChart = (subcommand: SlashCommandSubcommandBuilder) =>
{
    subcommand.setName(PtuQuickReferenceSubcommand.PowerChart);
    subcommand.setDescription(`Get a chart showing weight limits for power.`);

    return subcommand;
};

export const switchingPokemon = (subcommand: SlashCommandSubcommandBuilder) =>
{
    subcommand.setName(PtuQuickReferenceSubcommand.SwitchingPokemon);
    subcommand.setDescription('Get a flowchart that shows the types of actions to take when switching pokemon.');

    return subcommand;
};

export const trainingPokemon = (subcommand: SlashCommandSubcommandBuilder) =>
{
    subcommand.setName(PtuQuickReferenceSubcommand.TrainingPokemon);
    subcommand.setDescription('Get info about how to train your pokemon.');

    return subcommand;
};

export const weightClassChart = (subcommand: SlashCommandSubcommandBuilder) =>
{
    subcommand.setName(PtuQuickReferenceSubcommand.WeightClassChart);
    subcommand.setDescription(`Get a chart showing weight ranges for each weight class.`);

    return subcommand;
};

export const typeChart = (subcommand: SlashCommandSubcommandBuilder) =>
{
    subcommand.setName(PtuQuickReferenceSubcommand.TypeChart);
    subcommand.setDescription('Get an image of a chart with the strengths and weaknesses of each type.');

    return subcommand;
};
