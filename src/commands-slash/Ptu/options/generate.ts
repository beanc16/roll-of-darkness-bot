import type { SlashCommandStringOption, SlashCommandSubcommandBuilder } from 'discord.js';

import {
    pokemonMoveCategoryOption,
    pokemonMoveNameOption,
    pokemonTypeOption,
} from './shared.js';

export enum PtuGenerateSubcommand
{
    Move = 'move',
}

const promptOption = (option: SlashCommandStringOption, commandName: PtuGenerateSubcommand): SlashCommandStringOption =>
{
    option.setName('prompt');
    option.setDescription(`The prompt to generate the ${commandName}.`);
    return option.setRequired(true);
};

export const move = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuGenerateSubcommand.Move);
    subcommand.setDescription('Generate a custom move.');

    // Prompt
    subcommand.addStringOption((option) =>
    {
        return promptOption(option, PtuGenerateSubcommand.Move);
    });

    // Name
    subcommand.addStringOption((option) =>
    {
        // TODO: Change this option's name to "prexisting_move_name"
        return pokemonMoveNameOption(option, `The pre-existing move to base the new move on.`);
    });

    // Type
    subcommand.addStringOption((option) =>
    {
        return pokemonTypeOption(option, 'The type to make the move.');
    });

    // Move Category
    subcommand.addStringOption((option) =>
    {
        return pokemonMoveCategoryOption(option, 'The category to make the move.');
    });

    return subcommand;
};
