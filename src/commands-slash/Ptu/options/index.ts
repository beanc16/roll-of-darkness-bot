import {
    APIApplicationCommandOptionChoice,
    SlashCommandSubcommandBuilder,
    SlashCommandSubcommandGroupBuilder,
} from 'discord.js';

import { capitalizeFirstLetter } from '../../../services/stringHelpers.js';
import { TypeEffectivenessRole } from '../services/PokemonTypeEffectivenessService.js';
import { PtuAutocompleteParameterName } from '../types/autocomplete.js';
import { PokemonTypeAndNone } from '../types/pokemon.js';
import { PtuCharacterSheetName } from '../types/sheets.js';
import * as calculateSubcommands from './calculate.js';
import * as lookupSubcommands from './lookup.js';
import * as randomSubcommands from './random.js';
import * as rollSubcommands from './roll.js';

export enum PtuSubcommandGroup
{
    Breed = 'breed',
    Calculate = 'calculate',
    Lookup = 'lookup',
    QuickReference = 'quick_reference',
    Random = 'random',
    Roll = 'roll',
    Train = 'train',
    TypeEffectiveness = 'type_effectiveness',
}

export enum PtuQuickReferenceInfo
{
    ActionTypes = 'action_types',
    BookMechanics = 'book_mechanics',
    CoupDeGrace = 'coup_de_grace',
    DamageCharts = 'damage_charts',
    DamageFormula = 'damage_formula',
    PokemonExperienceChart = 'pokemon_experience_chart',
    PowerChart = 'power_chart',
    SwitchingPokemon = 'switching_pokemon',
    TrainingPokemon = 'training_pokemon',
    WeightClassChart = 'weight_class_chart',
    TypeChart = 'type_chart',
}

export const breed = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuSubcommandGroup.Breed);
    subcommand.setDescription('Breed two pokemon.');

    subcommand.addIntegerOption((option) =>
    {
        option.setName('pokemon_education_rank');
        option.setDescription(`The rank for your character's pokemon education.`);
        option.setMinValue(1);
        option.setMaxValue(8);
        return option.setRequired(true);
    });

    subcommand.addStringOption((option) =>
    {
        option.setName(PtuAutocompleteParameterName.MaleSpecies);
        option.setDescription('The species name of the male pokemon being bred.');
        option.setRequired(true);
        return option.setAutocomplete(true);
    });

    subcommand.addStringOption((option) =>
    {
        option.setName(PtuAutocompleteParameterName.FemaleSpecies);
        option.setDescription('The species name of the female pokemon being bred.');
        option.setRequired(true);
        return option.setAutocomplete(true);
    });

    subcommand.addUserOption((option) =>
    {
        option.setName('gm');
        option.setDescription('The user that runs your campaign.');
        return option.setRequired(true);
    });

    return subcommand;
};

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
                    .map(word => capitalizeFirstLetter(word))
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

export const typeEffectiveness = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuSubcommandGroup.TypeEffectiveness);
    subcommand.setDescription('Get the type effectiveness of Pokemon types based on the given parameters.');

    // Role
    subcommand.addStringOption((option) =>
    {
        option.setName('role');
        option.setDescription(`Whether to get offensive or defensive type effectiveness.`);

        const choices = Object.entries(TypeEffectivenessRole).map<APIApplicationCommandOptionChoice<string>>(
            ([key, value]) =>
            {
                return {
                    name: key,
                    value,
                };
            },
        );

        option.addChoices(...choices);
        return option.setRequired(true);
    });

    // Types
    const typeChoices = Object.entries(PokemonTypeAndNone).map<APIApplicationCommandOptionChoice<string>>(
        ([key, value]) =>
        {
            return {
                name: key,
                value,
            };
        },
    );
    for (let index = 1; index <= 3; index += 1)
    {
        subcommand.addStringOption((option) =>
        {
            option.setName(`type_${index}`);
            option.setDescription('The Pokemon type.');
            option.addChoices(...typeChoices);

            if (index === 1)
            {
                option.setRequired(true);
            }

            return option;
        });
    }

    // Ability names
    [
        PtuAutocompleteParameterName.Ability1,
        PtuAutocompleteParameterName.Ability2,
        PtuAutocompleteParameterName.Ability3,
        PtuAutocompleteParameterName.Ability4,
    ].forEach((name) =>
    {
        subcommand.addStringOption((option) =>
        {
            option.setName(name);
            option.setDescription(`The ability's name.`);
            return option.setAutocomplete(true);
        });
    });

    return subcommand;
};
