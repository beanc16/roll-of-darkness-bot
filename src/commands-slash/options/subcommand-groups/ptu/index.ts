import { APIApplicationCommandOptionChoice, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder } from 'discord.js';
import * as lookupSubcommands from './lookup.js';
import * as randomSubcommands from './random.js';
import { CharacterSheetName } from './train.js';

export enum PtuSubcommandGroup
{
    Lookup = 'lookup',
    QuickReference = 'quick_reference',
    Random = 'random',
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

export const train = (subcommand: SlashCommandSubcommandBuilder) =>
{
    subcommand.setName(PtuSubcommandGroup.Train);
    subcommand.setDescription('Train a pokemon on your character sheet.');

    subcommand.addStringOption((option) => {
        option.setName('pokemon_page_name');
        option.setDescription(`The name of the pokemon's page in the spreadsheet.`);
        return option.setRequired(true);
    });

    subcommand.addStringOption((option) => {
        option.setName('character_name');
        option.setDescription('The name of the character to train pokemon on.');

        const choices = Object.values(CharacterSheetName).map<APIApplicationCommandOptionChoice<string>>(
            (name) => {
                return {
                    name,
                    value: name,
                };
            }
        );
        return option.addChoices(...choices);
    });

    subcommand.addStringOption((option) => {
        option.setName('spreadsheet_id');
        return option.setDescription('The id of the google sheet to train pokemon on.');
    });

    subcommand.addIntegerOption((option) => {
        option.setName('num_of_training_sessions');
        return option.setDescription('The number of training sessions for the pokemon (default: 1).');
    });

    subcommand.addIntegerOption((option) => {
        option.setName('exp_per_training_session');
        return option.setDescription(`The experience to give per training session (default: whatever's on the sheet).`);
    });

    return subcommand;
};
