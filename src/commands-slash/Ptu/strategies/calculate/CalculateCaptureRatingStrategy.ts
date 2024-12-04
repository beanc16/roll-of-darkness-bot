import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import {
    PtuCalculateSubcommand,
    PtuPokemonEvolutionaryStage,
    PtuPokemonHpPercentage,
} from '../../subcommand-groups/calculate.js';

@staticImplements<ChatIteractionStrategy>()
export class CalculateCaptureRatingStrategy
{
    public static key: PtuCalculateSubcommand.CaptureRating = PtuCalculateSubcommand.CaptureRating;

    /* istanbul ignore next */
    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const pokemonLevel = interaction.options.getInteger('pokemon_level', true);
        const hpPercentage = interaction.options.getString('hp_percentage', true) as PtuPokemonHpPercentage;
        const remainingEvolutions = interaction.options.getString('num_of_remaining_evolutions', true) as PtuPokemonEvolutionaryStage;
        const isShiny = interaction.options.getBoolean('is_shiny') ?? false;
        const isParadox = interaction.options.getBoolean('is_paradox') ?? false;
        const isLegendary = interaction.options.getBoolean('is_legendary') ?? false;
        const numOfInjuries = interaction.options.getInteger('num_of_injuries') ?? 0;
        const numOfPersistentAfflictions = interaction.options.getInteger('num_of_persistent_afflictions') ?? 0;
        const numOfVolatileAfflictions = interaction.options.getInteger('num_of_volatile_afflictions') ?? 0;
        const isStuck = interaction.options.getBoolean('is_stuck') ?? false;
        const isSlowed = interaction.options.getBoolean('is_slowed') ?? false;
        const additionalModifier = interaction.options.getInteger('additional_modifier') ?? 0;

        // Get modifiers
        const hpPercentageModifier = this.getHpPercentageModifier(hpPercentage);
        const remainingEvolutionsModifier = this.getRemainingEvolutionsModifier(remainingEvolutions);
        const rarityModifier = this.getRarityModifier({
            isShiny,
            isParadox,
            isLegendary,
        });
        const getAfflictionsModifier = this.getAfflictionsModifier({
            numOfInjuries,
            numOfPersistentAfflictions,
            numOfVolatileAfflictions,
            isStuck,
            isSlowed,
        });

        // Calculate capture rating
        const captureRating = this.calculateCaptureRating({
            pokemonLevel,
            hpPercentageModifier,
            remainingEvolutionsModifier,
            rarityModifier,
            getAfflictionsModifier,
            additionalModifier,
        });

        // Send message
        await interaction.editReply(
            `The Pokémon has a capture rating of ${captureRating}.`,
        );

        return true;
    }

    private static calculateCaptureRating({
        pokemonLevel,
        hpPercentageModifier,
        remainingEvolutionsModifier,
        rarityModifier,
        getAfflictionsModifier,
        additionalModifier,
    }: {
        pokemonLevel: number;
        hpPercentageModifier: number;
        remainingEvolutionsModifier: number;
        rarityModifier: number;
        getAfflictionsModifier: number;
        additionalModifier: number;
    }): number
    {
        return Math.floor(
            100                             // Base
            - (pokemonLevel * 2)            // Level
            + hpPercentageModifier          // HP Percentage
            + remainingEvolutionsModifier   // Remaining Evolutions
            + rarityModifier                // Rarity
            + getAfflictionsModifier        // Afflictions
            + additionalModifier,           // Additional
        );
    }

    private static getHpPercentageModifier(hpPercentage: PtuPokemonHpPercentage): number
    {
        const resultMap: Record<PtuPokemonHpPercentage, number> = {
            [PtuPokemonHpPercentage.Above75Percent]: -30,
            [PtuPokemonHpPercentage.Between51And75Percent]: -15,
            [PtuPokemonHpPercentage.Between26And50Percent]: 0,
            [PtuPokemonHpPercentage.Between1And25Percent]: 15,
            [PtuPokemonHpPercentage.At1Hp]: 30,
        };

        return resultMap[hpPercentage];
    }

    private static getRemainingEvolutionsModifier(remainingEvolutions: PtuPokemonEvolutionaryStage): number
    {
        const resultMap: Record<PtuPokemonEvolutionaryStage, number> = {
            [PtuPokemonEvolutionaryStage.Zero]: -10,
            [PtuPokemonEvolutionaryStage.One]: 0,
            [PtuPokemonEvolutionaryStage.Two]: 10,
        };

        return resultMap[remainingEvolutions];
    }

    private static getRarityModifier({
        isShiny,
        isParadox,
        isLegendary,
    }: {
        isShiny: boolean;
        isParadox: boolean;
        isLegendary: boolean;
    }): number
    {
        let modifier = 0;

        if (isShiny)
        {
            modifier -= 10;
        }

        if (isParadox)
        {
            modifier -= 15;
        }

        if (isLegendary)
        {
            modifier -= 30;
        }

        return modifier;
    }

    private static getAfflictionsModifier({
        numOfInjuries,
        numOfPersistentAfflictions,
        numOfVolatileAfflictions,
        isStuck,
        isSlowed,
    }: {
        numOfInjuries: number;
        numOfPersistentAfflictions: number;
        numOfVolatileAfflictions: number;
        isStuck: boolean;
        isSlowed: boolean;
    }): number
    {
        let modifier = 0;

        // Injuries
        modifier += numOfInjuries * 5;

        // Persistent Afflictions
        modifier += numOfPersistentAfflictions * 10;

        // Volatile Afflictions
        modifier += numOfVolatileAfflictions * 5;

        // Conditionals
        if (isStuck)
        {
            modifier += 10;
        }

        if (isSlowed)
        {
            modifier += 5;
        }

        return modifier;
    }
}
