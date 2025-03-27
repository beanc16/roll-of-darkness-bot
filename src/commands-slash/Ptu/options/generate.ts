import type {
    APIApplicationCommandOptionChoice,
    SlashCommandStringOption,
    SlashCommandSubcommandBuilder,
} from 'discord.js';

import { PtuSkill } from '../types/pokemonTrainers.js';

export enum PtuGenerateSubcommand
{
    SkillBackground = 'skill_background',
}

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

    if (index <= 2)
    {
        option.setRequired(true);
    }

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
