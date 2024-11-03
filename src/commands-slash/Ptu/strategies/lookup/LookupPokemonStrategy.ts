import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { staticImplements } from '../../../../decorators/staticImplements.js';
import { PtuLookupSubcommand } from '../../subcommand-groups/lookup.js';

import { getLookupPokemonByAbilityEmbedMessages, getLookupPokemonByMoveEmbedMessages, getLookupPokemonEmbedMessages } from '../../../Ptu/embed-messages/lookup.js';
import { LookupStrategy } from '../../../strategies/BaseLookupStrategy.js';
import { PokemonController } from '../../dal/PtuController.js';
import { PokeApi } from '../../services/PokeApi.js';
import { PtuAbilityListType, PtuMoveListType, PtuPokemon } from '../../types/pokemon.js';
import { parseRegexByType, RegexLookupType } from '../../../../services/regexHelpers.js';

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
    public static key = PtuLookupSubcommand.Pokemon;

    static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
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
        else if (numOfTruthyValues > 1)
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
    }: GetLookupPokemonDataParameters = {})
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

        const { results = [] } = await PokemonController.getAll(searchParams);

        const names = results.map(({ name }: PtuPokemon) => name);

        // Don't include images for substring searches
        const imageUrlResults = (name && lookupType !== RegexLookupType.SubstringCaseInsensitive)
            ? await PokeApi.getImageUrls(names)
            : undefined;

        // Try to add imageUrl to pokemon result
        const pokemon = results.map((result: PtuPokemon) => {
            const { name } = result;

            const { imageUrl } = imageUrlResults?.find((result) =>
                result.name === PokeApi.parseName(name)
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
            } as PtuPokemon;
        }) as PtuPokemon[];

        // Sort by name
        pokemon.sort((a, b) =>
        {
            return a.name.localeCompare(b.name);
        });

        return pokemon;
    }

    private static parseSearchParameters({
        name,
        moveName,
        moveListType = PtuMoveListType.All,
        lookupType = RegexLookupType.SubstringCaseInsensitive,
        abilityName,
        abilityListType = PtuAbilityListType.All,
    }: GetLookupPokemonDataParameters = {})
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
                            RegexLookupType.SubstringCaseInsensitive
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
                    break;
                case PtuMoveListType.All:
                    const searchParams: object[] = [
                        PtuMoveListType.EggMoves,
                        PtuMoveListType.TutorMoves,
                        PtuMoveListType.ZygardeCubeMoves,
                    ].map((listType) => {
                        key = `moveList.${listType}`;
                        return {
                            [key]: moveName,
                        };
                    });

                    key = `moveList.${PtuMoveListType.TmHm}`;
                    searchParams.push({
                        [key]: parseRegexByType(
                            moveName,
                            RegexLookupType.SubstringCaseInsensitive
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
                    const searchParams: object[] = [
                        PtuAbilityListType.Basic,
                        PtuAbilityListType.Advanced,
                        PtuAbilityListType.High,
                    ].map((listType) => {
                        key = `abilities.${listType}`;
                        return {
                            [key]: abilityName,
                        };
                    });

                    return {
                        $or: searchParams,
                    };
                    break;
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
                moveName: moveName as string,
                moveListType,
            });
        }

        if (abilityName)
        {
            return getLookupPokemonByAbilityEmbedMessages(pokemon, {
                abilityName: abilityName as string,
                abilityListType,
            });
        }

        return [];
    }
}
