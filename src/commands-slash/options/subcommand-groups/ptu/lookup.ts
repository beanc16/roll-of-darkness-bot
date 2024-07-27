import { APIApplicationCommandOptionChoice, SlashCommandSubcommandBuilder } from 'discord.js';
import { PokemonType, PokemonMoveCategory, PtuMoveFrequency } from '../../../../constants/pokemon';
import { equalityOption } from '../../shared';

export enum PtuLookupSubcommand
{
    Move = 'move',
}

export const move = (subcommand: SlashCommandSubcommandBuilder) =>
{
    subcommand.setName(PtuLookupSubcommand.Move);
    subcommand.setDescription('Get a list of moves based on the given parameters.');

    // Type
    const typeChoices = Object.entries(PokemonType).map<APIApplicationCommandOptionChoice<string>>(
        ([key, value]) => {
            return {
                name: key,
                value: value,
            };
        }
    );
    subcommand.addStringOption((option) => {
        option.setName('type');
        option.setDescription('The type of moves to look up.');
        return option.setChoices(
            ...typeChoices,
        );
    });

    // Move Category
    const categoryChoices = Object.entries(PokemonMoveCategory).map<APIApplicationCommandOptionChoice<string>>(
        ([key, value]) => {
            return {
                name: key,
                value: value,
            };
        }
    );
    subcommand.addStringOption((option) => {
        option.setName('category');
        option.setDescription('The category of moves to look up.');
        return option.setChoices(
            ...categoryChoices,
        );
    });

    // Damage Base
    subcommand.addIntegerOption((option) => {
        option.setName('damage_base');
        option.setDescription('The damage base of moves to look up.');
        option.setMinValue(1);
        option.setMaxValue(28);
        return option;
    });
    subcommand.addStringOption((option) => {
        return equalityOption(option)
            .setName('damage_base_equality')
            .setDescription('The provided damage base value should be ??? to the moves (default: Equals)');
    });

    // Frequency
    const frequencyChoices = Object.values(PtuMoveFrequency).map<APIApplicationCommandOptionChoice<string>>(
        (value) => {
            return {
                name: value,
                value: value,
            };
        }
    );
    subcommand.addStringOption((option) => {
        option.setName('frequency');
        option.setDescription('The frequency of moves to look up.');
        return option.setChoices(
            ...frequencyChoices,
        );
    });

    // TODO: Add AC

    // TODO: Add range

    // TODO: Add general string searching (of name, effect, etc.)

    return subcommand;
};
