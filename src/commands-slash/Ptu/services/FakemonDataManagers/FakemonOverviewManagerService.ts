import { EmbedBuilder } from 'discord.js';

import { FakemonLevelUpMoveDistributionEmbedMessage, LevelUpMoveDistribution } from '../../components/fakemon/embeds/FakemonLevelUpMoveDistributionEmbedMessage.js';
import { FakemonLevelUpMoveProgressionEmbedMessage } from '../../components/fakemon/embeds/FakemonLevelUpMoveProgressionEmbedMessage.js';
import { PtuFakemonCollection } from '../../dal/models/PtuFakemonCollection.js';
import { getPokemonWithMove, PtuPokemonForLookupPokemon } from '../../embed-messages/lookup.js';
import { PtuMove } from '../../models/PtuMove.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import { PtuLookupSubcommand } from '../../options/lookup.js';
import { LookupMoveStrategy } from '../../strategies/lookup/LookupMoveStrategy.js';
import { LookupPokemonStrategy } from '../../strategies/lookup/LookupPokemonStrategy.js';
import { PtuMoveListType } from '../../types/pokemon.js';
import { PtuStrategyMap } from '../../types/strategies.js';

export class FakemonOverviewManagerService
{
    public static async getLevelUpMoveDistributionEmbed({ strategies, fakemon }: {
        strategies: PtuStrategyMap;
        fakemon: PtuFakemonCollection;
    }): Promise<EmbedBuilder | undefined>
    {
        // Get moves
        const levelUpMoveNames = fakemon.moveList.levelUp.map(({ move }) => move);
        const moves = await (strategies[PtuSubcommandGroup.Lookup][PtuLookupSubcommand.Move] as typeof LookupMoveStrategy | undefined)?.getLookupData({
            names: fakemon.moveList.levelUp.map(({ move }) => move),
        }) ?? [];
        const basedOnMoveNames = moves.reduce<string[]>((acc, { basedOn }) =>
        {
            if (basedOn)
            {
                acc.push(basedOn);
            }
            return acc;
        }, []);
        const basedOnMoves = basedOnMoveNames.length > 0
            ? (await (strategies[PtuSubcommandGroup.Lookup][PtuLookupSubcommand.Move] as typeof LookupMoveStrategy | undefined)?.getLookupData({
                names: basedOnMoveNames,
            }) ?? [])
            : [];

        // Create move arrays and sets
        const allMoveNames = [
            ...levelUpMoveNames,
            ...basedOnMoveNames,
        ];
        const moveNameToMove = [...moves, ...basedOnMoves].reduce<Record<string, typeof moves[number]>>((acc, move) =>
        {
            acc[move.name] = move;
            return acc;
        }, {});
        const moveNameToBasedOnMove = moves.reduce<Record<string, typeof moves[number] | undefined>>((acc, move) =>
        {
            if (move.basedOn)
            {
                acc[move.name] = moveNameToMove[move.basedOn];
            }
            return acc;
        }, {});

        // Get pokemon with level up and based on moves
        const pokemonWithLevelUpAndBasedOnMoves = await (strategies[PtuSubcommandGroup.Lookup][PtuLookupSubcommand.Pokemon] as typeof LookupPokemonStrategy | undefined)?.getLookupData({
            moveNames: allMoveNames,
            moveListType: PtuMoveListType.LevelUp,
        }) ?? [];

        if (pokemonWithLevelUpAndBasedOnMoves.length === 0)
        {
            return undefined;
        }

        // Get distribution
        const distribution = this.calculateDistribution({
            fakemon,
            pokemonWithLevelUpAndBasedOnMoves,
            moveNameToBasedOnMove,
        });

        return new FakemonLevelUpMoveDistributionEmbedMessage(fakemon.name, distribution);
    }

    private static calculateDistribution({
        fakemon,
        pokemonWithLevelUpAndBasedOnMoves,
        moveNameToBasedOnMove,
    }: {
        fakemon: PtuFakemonCollection;
        pokemonWithLevelUpAndBasedOnMoves: PtuPokemonForLookupPokemon[];
        moveNameToBasedOnMove: Record<string, PtuMove | undefined>;
    }): LevelUpMoveDistribution
    {
        const {
            levelDifferences,
            levelDifferencesWithBasedOnInstead,
            ...rest
        } = fakemon.moveList.levelUp.reduce<
            Omit<LevelUpMoveDistribution, 'avgDeviation' | 'avgDeviationBasedOn'> & {
                levelDifferences: number[];
                levelDifferencesWithBasedOnInstead: number[];
            }
        >((acc, { move: moveName, level }) =>
        {
            // Get move's average level
            const { averageLevel, levelUp } = getPokemonWithMove({
                pokemon: pokemonWithLevelUpAndBasedOnMoves,
                moveName,
                moveListType: PtuMoveListType.LevelUp,
            });
            const isLearnedByLevelUp = levelUp.length > 0;

            // Get move level
            const parsedLevel = parseInt(level.toString(), 10);
            const isNan = Number.isNaN(parsedLevel);

            if (isNan)
            {
                acc.outliers.push({
                    moveName,
                    level: 0,
                    averageLevel,
                });
                return acc;
            }

            // Set level difference
            const levelDifference = parsedLevel - averageLevel;
            if (isLearnedByLevelUp)
            {
                // Average level of 0 means no pokemon know the move yet
                acc.levelDifferences.push(levelDifference);
            }

            // Get based on move name and level
            const basedOnMove = moveNameToBasedOnMove[moveName];
            let basedOnAverageLevel: number | undefined;
            let basedOnLevelDifference: number | undefined;
            if (basedOnMove)
            {
                const { averageLevel: basedOnAverageLevelLocal, levelUp: basedOnLevelUp } = getPokemonWithMove({
                    pokemon: pokemonWithLevelUpAndBasedOnMoves,
                    moveName: basedOnMove.name,
                    moveListType: PtuMoveListType.LevelUp,
                });
                if (basedOnLevelUp.length > 0)
                {
                    // Pokemon learn the move by level up
                    basedOnAverageLevel = basedOnAverageLevelLocal;
                    basedOnLevelDifference = parsedLevel - basedOnAverageLevelLocal;
                    acc.levelDifferencesWithBasedOnInstead.push(basedOnLevelDifference);
                }
            }
            else
                if (isLearnedByLevelUp)
                {
                    // Pokemon learn the move by level up
                    acc.levelDifferencesWithBasedOnInstead.push(levelDifference);
                }

            // Get category key
            let categoryKey: keyof Exclude<typeof acc, 'levelDifferences'> = 'avg';

            // Get level difference to compare
            const levelDifferenceToCompare = isLearnedByLevelUp
                ? levelDifference
                : basedOnLevelDifference; // Fall back to based on move average

            // Is not learned by level up (and neither is a based on move if one exists)
            if (levelDifferenceToCompare === undefined)
            {
                categoryKey = 'outliers';
            }
            // <= -16
            else if (levelDifferenceToCompare <= -16)
            {
                categoryKey = 'lessThanOrEqual16';
            }
            // -16 - -11
            else if (levelDifferenceToCompare <= -11 && levelDifferenceToCompare > -16)
            {
                categoryKey = 'lessThanOrEqual11';
            }
            // -11 - -6
            else if (levelDifferenceToCompare <= -6 && levelDifferenceToCompare > -11)
            {
                categoryKey = 'lessThanOrEqual6';
            }
            // 6 - 11
            else if (levelDifferenceToCompare >= 6 && levelDifferenceToCompare < 11)
            {
                categoryKey = 'greaterThanOrEqual6';
            }
            // 11 - 16
            else if (levelDifferenceToCompare >= 11 && levelDifferenceToCompare < 16)
            {
                categoryKey = 'greaterThanOrEqual11';
            }
            // >= 16
            else if (levelDifferenceToCompare >= 16)
            {
                categoryKey = 'greaterThanOrEqual16';
            }

            // Set data
            acc[categoryKey].push({
                moveName,
                level: parsedLevel,
                averageLevel,
                ...(basedOnMove
                    ? {
                        basedOnMove: basedOnMove.name,
                        basedOnAverageLevel,
                    }
                    : {}),
            });

            return acc;
        }, {
            lessThanOrEqual16: [],
            lessThanOrEqual11: [],
            lessThanOrEqual6: [],
            avg: [],
            greaterThanOrEqual6: [],
            greaterThanOrEqual11: [],
            greaterThanOrEqual16: [],
            outliers: [],
            levelDifferences: [],
            levelDifferencesWithBasedOnInstead: [],
        });

        return {
            ...rest,
            avgDeviation: this.calculateAverageDeviation(levelDifferences),
            avgDeviationBasedOn: this.calculateAverageDeviation(levelDifferencesWithBasedOnInstead),
        };
    }

    private static calculateAverageDeviation(levelDifferences: number[]): number
    {
        const totalDifference = levelDifferences.reduce((acc, levelDifference) => acc + levelDifference, 0);

        if (levelDifferences.length === 0)
        {
            return 0;
        }

        return totalDifference / levelDifferences.length;
    }

    public static getLevelUpMoveProgressionEmbed(fakemon: PtuFakemonCollection): EmbedBuilder | undefined
    {
        const { types, moveList: { levelUp = [] } = {} } = fakemon;

        if (levelUp.length === 0)
        {
            return undefined;
        }

        const initialTypeMap = types.reduce<Record<string, typeof levelUp>>((acc, curType) =>
        {
            acc[curType] = [];
            return acc;
        }, {});

        // Set moves by type (and non-main types)
        const typeToLevelUpMoves = levelUp.reduce<Record<string, typeof levelUp>>((acc, cur) =>
        {
            const curType = types.find(type => type === cur.type);

            if (curType)
            {
                acc[curType].push(cur);
            }
            else
            {
                acc.Other.push(cur);
            }

            return acc;
        }, {
            ...initialTypeMap,
            Other: [],
        });

        return new FakemonLevelUpMoveProgressionEmbedMessage(fakemon, typeToLevelUpMoves);
    }
}
