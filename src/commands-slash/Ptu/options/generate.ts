import type {
    APIApplicationCommandOptionChoice,
    SlashCommandStringOption,
    SlashCommandSubcommandBuilder,
} from 'discord.js';

import { promptOption } from '../../Ai/options/sharedOptions.js';
import { PtuSkill } from '../types/pokemonTrainers.js';

export enum PtuGenerateSubcommand
{
    AbilityNames = 'ability_names',
    MoveNames = 'move_names',
    SkillBackground = 'skill_background',
}

export const abilityNames = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuGenerateSubcommand.AbilityNames);
    subcommand.setDescription('Generate a list of ability name ideas.');

    // Prompt
    subcommand.addStringOption((option) =>
    {
        return promptOption(option, {
            commandName: PtuGenerateSubcommand.AbilityNames,
            description: 'The description of the ability you want to generate.',
            isRequired: true,
        });
    });

    // Number of abilities
    subcommand.addIntegerOption((option) =>
    {
        option.setName('number_of_abilities');
        option.setDescription('The number of ability names to generate (default: 10).');
        option.setMinValue(1);
        return option.setMaxValue(25);
    });

    // Include descriptions
    subcommand.addBooleanOption((option) =>
    {
        option.setName('include_descriptions');
        return option.setDescription('Include ability flavor descriptions (default: false).');
    });

    return subcommand;
};

export const moveNames = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuGenerateSubcommand.MoveNames);
    subcommand.setDescription('Generate a list of move name ideas.');

    // Prompt
    subcommand.addStringOption((option) =>
    {
        return promptOption(option, {
            commandName: PtuGenerateSubcommand.MoveNames,
            description: 'The description of the move you want to generate.',
            isRequired: true,
        });
    });

    // Number of moves
    subcommand.addIntegerOption((option) =>
    {
        option.setName('number_of_moves');
        option.setDescription('The number of move names to generate (default: 10).');
        option.setMinValue(1);
        return option.setMaxValue(25);
    });

    // Include descriptions
    subcommand.addBooleanOption((option) =>
    {
        option.setName('include_descriptions');
        return option.setDescription('Include move flavor descriptions (default: false).');
    });

    return subcommand;
};

const skill = (
    option: SlashCommandStringOption,
    raisedOrLowered: 'raised' | 'lowered',
    index: number,
): SlashCommandStringOption =>
{
    option.setName(`${raisedOrLowered}_skill_${index}`);
    option.setDescription(`The ${raisedOrLowered} skill.`);

    const choices = Object.values(PtuSkill).map<APIApplicationCommandOptionChoice<string>>(
        (name) =>
        {
            return {
                name,
                value: name,
            };
        },
    );
    option.addChoices(...choices);

    return option;
};

export const skillBackground = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuGenerateSubcommand.SkillBackground);
    subcommand.setDescription('Generate a list of skill background ideas.');

    // Species
    subcommand.addStringOption((option) =>
    {
        option.setName('pokemon_species');
        option.setDescription('The species of the pokemon to generate a skill background for.');
        return option.setRequired(true);
    });

    // Skills
    for (let index = 1; index <= 2; index += 1)
    {
        subcommand.addStringOption((option) =>
        {
            return skill(option, 'raised', index);
        });
    }
    for (let index = 1; index <= 2; index += 1)
    {
        subcommand.addStringOption((option) =>
        {
            return skill(option, 'lowered', index);
        });
    }
    subcommand.addStringOption((option) =>
    {
        return skill(option, 'raised', 3);
    });
    subcommand.addStringOption((option) =>
    {
        return skill(option, 'lowered', 3);
    });

    // Significance
    subcommand.addStringOption((option) =>
    {
        option.setName('significance');
        return option.setDescription('"Evokes feelings of-", "Sounds like-", "Phrased like-", "Feels-", etc.');
    });

    // Lore
    subcommand.addStringOption((option) =>
    {
        option.setName('lore');
        return option.setDescription('Brief lore/backstory about the pokemon.');
    });

    return subcommand;
};
