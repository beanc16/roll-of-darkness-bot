import type { SlashCommandSubcommandBuilder } from 'discord.js';

import { promptOption } from '../../Ai/options/sharedOptions.js';
import {
    pokemonMoveCategoryOption,
    pokemonMoveNameOption,
    pokemonTypeOption,
} from './shared.js';

export enum PtuGenerateDevSubcommand
{
    Move = 'move',
}

export const move = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuGenerateDevSubcommand.Move);
    subcommand.setDescription('Generate a custom move.');

    // Prompt
    subcommand.addStringOption((option) =>
    {
        return promptOption(option, { commandName: PtuGenerateDevSubcommand.Move });
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
