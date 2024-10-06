import { ChatInputCommandInteraction } from 'discord.js';

import { ChatIteractionStrategy } from '../../ChatIteractionStrategy.js';
import { staticImplements } from '../../../../decorators/staticImplements.js';
import { PtuCalculateSubcommand, PtuPokemonEvolutionaryStage, PtuPokemonHpPercentage } from '../../../options/subcommand-groups/ptu/calculate.js';

@staticImplements<ChatIteractionStrategy>()
export class CalculateCaptureRatingStrategy
{
    public static key = PtuCalculateSubcommand.CaptureRating;

    static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const pokemonLevel = interaction.options.getInteger('pokemon_level', true);
        const hpPercentage = interaction.options.getString('hp_percentage', true) as PtuPokemonHpPercentage;
        const remainingEvolutions = interaction.options.getString('num_of_remaining_evolutions', true) as PtuPokemonEvolutionaryStage;
        const isShiny = interaction.options.getBoolean('is_shiny') ?? false;
        const isLegendary = interaction.options.getBoolean('is_legendary') ?? false;
        const numOfInjuries = interaction.options.getInteger('num_of_injuries') ?? 0;
        const numOfPersistentAfflictions = interaction.options.getInteger('num_of_persistent_afflictions') ?? 0;
        const numOfVolatileAfflictions = interaction.options.getInteger('num_of_volatile_afflictions') ?? 0;
        const isStuck = interaction.options.getBoolean('is_stuck') ?? false;
        const isSlowed = interaction.options.getBoolean('is_slowed') ?? false;

        // Get modifiers
        const hpPercentageModifier = this.getHpPercentageModifier(hpPercentage);
        const remainingEvolutionsModifier = this.getRemainingEvolutionsModifier(remainingEvolutions);
        const rarityModifier = this.getRarityModifier({
            isShiny,
            isLegendary,
        });
        const getAfflictionsModifier = this.getAfflictionsModifier({
            numOfInjuries,
            numOfPersistentAfflictions,
            numOfVolatileAfflictions,
            isStuck,
            isSlowed,
        })

        // Calculate capture rating
        const captureRating = this.calculateCaptureRating({
            pokemonLevel,
            hpPercentageModifier,
            remainingEvolutionsModifier,
            rarityModifier,
            getAfflictionsModifier,
        });

        // Send message
        await interaction.editReply({
            content: `The pokemon has a capture rating of ${captureRating}.`,
        });

        return true;
    }

    private static calculateCaptureRating({
        pokemonLevel,
        hpPercentageModifier,
        remainingEvolutionsModifier,
        rarityModifier,
        getAfflictionsModifier,
    }: {
        pokemonLevel: number;
        hpPercentageModifier: number;
        remainingEvolutionsModifier: number;
        rarityModifier: number;
        getAfflictionsModifier: number;
    }): number
    {
        return Math.floor(
            100                             // Base
            - (pokemonLevel * 2)            // Level
            + hpPercentageModifier          // HP Percentage
            + remainingEvolutionsModifier   // Remaining Evolutions
            + rarityModifier                // Rarity
            + getAfflictionsModifier        // Afflictions
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
        isLegendary,
    }: {
        isShiny: boolean;
        isLegendary: boolean;
    })
    {
        let modifier = 0;

        if (isShiny)
        {
            modifier -= 10;
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
