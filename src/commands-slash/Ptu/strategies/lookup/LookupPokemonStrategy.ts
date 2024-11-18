import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { parseRegexByType, RegexLookupType } from '../../../../services/regexHelpers.js';
import { LookupStrategy } from '../../../strategies/BaseLookupStrategy.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { PokemonController } from '../../dal/PtuController.js';
import {
    getLookupPokemonByAbilityEmbedMessages,
    getLookupPokemonByMoveEmbedMessages,
    getLookupPokemonEmbedMessages,
} from '../../embed-messages/lookup.js';
import { PokeApi } from '../../services/PokeApi.js';
import { PtuLookupSubcommand } from '../../subcommand-groups/lookup.js';
import {
    PtuAbilityListType,
    PtuMoveListType,
    PtuPokemon,
} from '../../types/pokemon.js';

export interface GetLookupPokemonDataParameters
{
    name?: string | null;
    lookupType?: RegexLookupType;
    moveName?: string | null;
    moveListType?: PtuMoveListType;
    abilityName?: string | null;
    abilityListType?: PtuAbilityListType;
}

interface GetLookupPokemonEmbedsParameters extends Omit<GetLookupPokemonDataParameters, 'lookupType'>
{
    pokemon: PtuPokemon[];
}

@staticImplements<ChatIteractionStrategy>()
export class LookupPokemonStrategy
{
    public static key: PtuLookupSubcommand.Pokemon = PtuLookupSubcommand.Pokemon;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString('pokemon_name');
        const moveName = interaction.options.getString('move_name');
        const moveListType = (interaction.options.getString('move_list_type') ?? PtuMoveListType.All) as PtuMoveListType;
        const abilityName = interaction.options.getString('ability_name');
        const abilityListType = (interaction.options.getString('ability_list_type') ?? PtuAbilityListType.All) as PtuAbilityListType;

        const numOfTruthyValues = [name, moveName, abilityName].filter(Boolean).length;
        if (numOfTruthyValues === 0)
        {
            await interaction.editReply('Cannot look up a Pokémon without a name, move, or ability.');
            return true;
        }

        if (numOfTruthyValues > 1)
        {
            await interaction.editReply('Cannot look up a Pokémon by more than just one of name, move, or ability at the same time.');
            return true;
        }

        const pokemon = await this.getLookupData({
            name,
            lookupType: RegexLookupType.ExactMatchCaseInsensitive,
            moveName,
            moveListType,
            abilityName,
            abilityListType,
        });

        // Get message
        const embeds = this.getLookupPokemonEmbeds({
            name,
            moveName,
            moveListType,
            abilityName,
            abilityListType,
            pokemon,
        });

        return await LookupStrategy.run(interaction, embeds, {
            noEmbedsErrorMessage: 'No Pokémon were found.',
        });
    }

    public static async getLookupData({
        name,
        lookupType = RegexLookupType.SubstringCaseInsensitive,
        moveName,
        moveListType = PtuMoveListType.All,
        abilityName,
        abilityListType = PtuAbilityListType.All,
    }: GetLookupPokemonDataParameters = {}): Promise<PtuPokemon[]>
    {
        if (!(name || moveName || abilityName))
        {
            return [];
        }

        const searchParams = this.parseSearchParameters({
            name,
            moveName,
            moveListType,
            lookupType,
            abilityName,
            abilityListType,
        });

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- This is safe based on knowledge of the consumed package
        const { results: untypedResults = [] } = await PokemonController.getAll(searchParams);
        const results = untypedResults as PtuPokemon[];

        const names = results.map(({ name: pokemonName }) => pokemonName);

        // Don't include images for substring searches
        const imageUrlResults = (name && lookupType !== RegexLookupType.SubstringCaseInsensitive)
            ? await PokeApi.getImageUrls(names)
            : undefined;

        // Try to add imageUrl to pokemon result
        const pokemon = results.map((result) =>
        {
            const { imageUrl } = imageUrlResults?.find(curImageResult =>
                curImageResult.name === PokeApi.parseName(result.name),
            ) ?? {};

            if (!imageUrl)
            {
                return result;
            }

            return {
                ...result,
                metadata: {
                    ...result.metadata,
                    imageUrl,
                },
            };
        });

        // Sort by name
        pokemon.sort((a, b) => a.name.localeCompare(b.name));

        return pokemon;
    }

    private static parseSearchParameters({
        name,
        moveName,
        moveListType = PtuMoveListType.All,
        lookupType = RegexLookupType.SubstringCaseInsensitive,
        abilityName,
        abilityListType = PtuAbilityListType.All,
    }: GetLookupPokemonDataParameters = {}): Record<string, string | RegExp | object | object[] | undefined>
    {
        if (name)
        {
            return {
                name: parseRegexByType(name, lookupType),
            };
        }

        if (moveName)
        {
            let key: string;
            // eslint-disable-next-line default-case
            switch (moveListType)
            {
            case PtuMoveListType.EggMoves:
            case PtuMoveListType.TutorMoves:
            case PtuMoveListType.ZygardeCubeMoves:
                key = `moveList.${moveListType}`;
                return {
                    [key]: moveName,
                };
                break;
            case PtuMoveListType.TmHm:
                key = `moveList.${moveListType}`;
                return {
                    [key]: parseRegexByType(
                        moveName,
                        RegexLookupType.SubstringCaseInsensitive,
                    ),
                };
                break;
            case PtuMoveListType.LevelUp:
                key = `moveList.${moveListType}`;
                return {
                    [key]: {
                        $elemMatch: {
                            move: moveName,
                        },
                    },
                };
            case PtuMoveListType.All:
                // eslint-disable-next-line no-case-declarations
                const searchParams: object[] = [
                    PtuMoveListType.EggMoves,
                    PtuMoveListType.TutorMoves,
                    PtuMoveListType.ZygardeCubeMoves,
                ].map((listType) =>
                {
                    key = `moveList.${listType}`;
                    return {
                        [key]: moveName,
                    };
                });

                key = `moveList.${PtuMoveListType.TmHm}`;
                searchParams.push({
                    [key]: parseRegexByType(
                        moveName,
                        RegexLookupType.SubstringCaseInsensitive,
                    ),
                });

                key = `moveList.${PtuMoveListType.LevelUp}`;
                searchParams.push({
                    [key]: {
                        $elemMatch: {
                            move: moveName,
                        },
                    },
                });

                return {
                    $or: searchParams,
                };
                break;
            }
        }

        if (abilityName)
        {
            let key: string;
            // eslint-disable-next-line default-case
            switch (abilityListType)
            {
            case PtuAbilityListType.Basic:
            case PtuAbilityListType.Advanced:
            case PtuAbilityListType.High:
                key = `abilities.${abilityListType}`;
                return {
                    [key]: abilityName,
                };
                break;
            case PtuAbilityListType.All:
                // eslint-disable-next-line no-case-declarations
                const searchParams: object[] = [
                    PtuAbilityListType.Basic,
                    PtuAbilityListType.Advanced,
                    PtuAbilityListType.High,
                ].map((listType) =>
                {
                    key = `abilities.${listType}`;
                    return {
                        [key]: abilityName,
                    };
                });

                return {
                    $or: searchParams,
                };
            }
        }

        return {};
    }

    private static getLookupPokemonEmbeds({
        name,
        moveName,
        moveListType = PtuMoveListType.All,
        abilityName,
        abilityListType = PtuAbilityListType.All,
        pokemon,
    }: GetLookupPokemonEmbedsParameters): EmbedBuilder[]
    {
        if (name)
        {
            return getLookupPokemonEmbedMessages(pokemon);
        }

        if (moveName)
        {
            return getLookupPokemonByMoveEmbedMessages(pokemon, {
                moveName,
                moveListType,
            });
        }

        if (abilityName)
        {
            return getLookupPokemonByAbilityEmbedMessages(pokemon, {
                abilityName,
                abilityListType,
            });
        }

        return [];
    }
}
