import { APIApplicationCommandOptionChoice, SlashCommandSubcommandBuilder } from 'discord.js';

export enum PtuCalculateSubcommand
{
    BattleExp = 'battle_exp',
    CaptureRating = 'capture_rating',
}

export enum PtuPokemonHpPercentage
{
    Above75Percent = 'Above 75%',
    Between51And75Percent = '51-75%',
    Between26And50Percent = '26-50%',
    Between1And25Percent = '1-25%',
    At1Hp = 'Exactly 1hp',
}

export enum PtuPokemonEvolutionaryStage
{
    Zero = 'zero_remaining',
    One = 'one_remaining',
    Two = 'two_remaining',
}

export const battleExp = (subcommand: SlashCommandSubcommandBuilder) =>
{
    subcommand.setName(PtuCalculateSubcommand.BattleExp);
    subcommand.setDescription('Calculate the experience players receive after a battle.');

    subcommand.addStringOption((option) => {
        option.setName('total_levels_of_enemies');
        option.setDescription(`A mathematical formula of the total level of enemies (only addition is supported; IE: 5 + 15).`);
        return option.setRequired(true);
    });

    subcommand.addNumberOption((option) => {
        option.setName('significance_multiplier');
        option.setDescription(`The significance of the encounter between 1-5.`);
        return option.setRequired(true);
    });

    subcommand.addIntegerOption((option) => {
        option.setName('num_of_players');
        option.setDescription(`The number of players (not pokemon) gaining experience.`);
        return option.setRequired(true);
    });

    return subcommand;
};

export const captureRating = (subcommand: SlashCommandSubcommandBuilder) =>
{
    subcommand.setName(PtuCalculateSubcommand.CaptureRating);
    subcommand.setDescription('Calculate the capture rating of a pokemon.');

    // Level
    subcommand.addIntegerOption((option) => {
        option.setName('pokemon_level');
        option.setDescription(`The level of the pokemon a player is trying to capture.`);
        return option.setRequired(true);
    });

    // Pokemon's HP Percentage
    const hpPercentChoices = Object.values(PtuPokemonHpPercentage).map<APIApplicationCommandOptionChoice<string>>(
        (value) => {
            return {
                name: value,
                value: value,
            };
        }
    );
    subcommand.addStringOption((option) => {
        option.setName('hp_percentage');
        option.setDescription(`The percentage of the pokemon's remaining HP.`);
        option.setChoices(
            ...hpPercentChoices,
        );
        return option.setRequired(true);
    });

    // Evolutionary Stage
    const evolutionChoices = Object.entries(PtuPokemonEvolutionaryStage).map<APIApplicationCommandOptionChoice<string>>(
        ([key, value]) => {
            return {
                name: key,
                value: value,
            };
        }
    );
    subcommand.addStringOption((option) => {
        option.setName('num_of_remaining_evolutions');
        option.setDescription('The number of Evolutionary Stages remaining.');
        option.setChoices(
            ...evolutionChoices,
        );
        return option.setRequired(true);
    });

    // Rarity
    subcommand.addBooleanOption((option) => {
        option.setName('is_shiny');
        return option.setDescription(`The pokemon is Shiny (default: false).`);
    });

    subcommand.addBooleanOption((option) => {
        option.setName('is_legendary');
        return option.setDescription(`The pokemon is Legendary (default: false).`);
    });

    // Injuries
    subcommand.addIntegerOption((option) => {
        option.setName('num_of_injuries');
        return option.setDescription('The number of Injuries the pokemon has (default: 0).');
    });

    // Status Afflictions
    subcommand.addIntegerOption((option) => {
        option.setName('num_of_persistent_afflictions');
        return option.setDescription('Burned, Frozen, Paralyzed, Poison (default: 0).');
    });

    subcommand.addIntegerOption((option) => {
        option.setName('num_of_volatile_afflictions');
        return option.setDescription('Bad Sleep, Confused, Cursed, Disabled, Rage, Flinch, Infatuation, Sleep, Suppressed (default: 0).');
    });

    subcommand.addBooleanOption((option) => {
        option.setName('is_stuck');
        return option.setDescription(`The pokemon has the Stuck affliction (default: false).`);
    });

    subcommand.addBooleanOption((option) => {
        option.setName('is_slowed');
        return option.setDescription(`The pokemon has the Slowed affliction (default: false).`);
    });

    return subcommand;
};
