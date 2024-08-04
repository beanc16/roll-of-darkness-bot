import { APIApplicationCommandOptionChoice, SlashCommandSubcommandBuilder } from 'discord.js';
import { PokemonType, PokemonMoveCategory, PtuMoveFrequency } from '../../../../constants/pokemon';
import { equalityOption } from '../../shared';

export enum PtuLookupSubcommand
{
    Ability = 'ability',
    Move = 'move',
}

export const ability = (subcommand: SlashCommandSubcommandBuilder) =>
{
    subcommand.setName(PtuLookupSubcommand.Ability);
    subcommand.setDescription('Get a list of abilities based on the given parameters.');

    // Name
    subcommand.addStringOption((option) => {
        option.setName('ability_name');
        option.setDescription(`The ability's name.`);
        return option.setAutocomplete(true);
    });

    // Searches
    subcommand.addStringOption((option) => {
        option.setName('name_search');
        return option.setDescription(`A search on the move's name.`);
    });

    subcommand.addStringOption((option) => {
        option.setName('frequency_search');
        return option.setDescription(`A search on the move's frequency.`);
    });

    subcommand.addStringOption((option) => {
        option.setName('effect_search');
        return option.setDescription(`A search on the move's effect.`);
    });

    return subcommand;
};

export const move = (subcommand: SlashCommandSubcommandBuilder) =>
{
    subcommand.setName(PtuLookupSubcommand.Move);
    subcommand.setDescription('Get a list of moves based on the given parameters.');

    // Name
    subcommand.addStringOption((option) => {
        option.setName('move_name');
        option.setDescription(`The move's name.`);
        return option.setAutocomplete(true);
    });

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
            .setDescription('The provided DB should be ??? to the moves DB (default: Equals)');
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

    // AC
    subcommand.addIntegerOption((option) => {
        option.setName('ac');
        option.setDescription('The AC of moves to look up.');
        option.setMinValue(0);
        option.setMaxValue(10);
        return option;
    });
    subcommand.addStringOption((option) => {
        return equalityOption(option)
            .setName('ac_equality')
            .setDescription('The provided AC should be ??? to the moves AC (default: Equals)');
    });

    // Searches
    subcommand.addStringOption((option) => {
        option.setName('name_search');
        return option.setDescription(`A search on the move's name.`);
    });

    subcommand.addStringOption((option) => {
        option.setName('range_search');
        return option.setDescription(`A search on the move's range.`);
    });

    subcommand.addStringOption((option) => {
        option.setName('effect_search');
        return option.setDescription(`A search on the move's effect.`);
    });

    return subcommand;
};
