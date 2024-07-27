import { APIApplicationCommandOptionChoice, SlashCommandSubcommandBuilder } from 'discord.js';
import { PokemonType } from '../../../../constants/pokemon';
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
    const typeChoices = Object.keys(PokemonType).map<APIApplicationCommandOptionChoice<string>>(
        (type) => {
            return {
                name: type,
                value: type,
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

    // TODO: Add move category

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

    // TODO: Add frequency

    // TODO: Add AC

    // TODO: Add range

    // TODO: Add general string searching (of name, effect, etc.)

    return subcommand;
};
