import { ChatInputCommandInteraction } from 'discord.js';

import { ChatIteractionStrategy } from '../../ChatIteractionStrategy.js';
import { staticImplements } from '../../../../decorators/staticImplements.js';
import { PtuLookupSubcommand } from '../../../options/subcommand-groups/ptu/lookup.js';

import { getLookupPokemonByMoveEmbedMessages, getLookupPokemonEmbedMessages } from '../../../embed-messages/ptu/lookup.js';
import { BaseLookupRespondStrategy } from './BaseLookupRespondStrategy.js';
import { PokemonController } from '../../../../dal/PtuController.js';
import { PokeApi } from '../../../../services/PokeApi.js';
import { PtuMoveListType, PtuPokemon } from '../../../../types/pokemon.js';
import { parseRegexByType, RegexLookupType } from '../../../../services/regexHelpers.js';

export interface GetLookupPokemonDataParameters
{
    name?: string | null;
    lookupType?: RegexLookupType;
    moveName?: string | null;
    moveListType?: PtuMoveListType;
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

        if (!(name || moveName))
        {
            await interaction.editReply('Cannot look up a pokemon without a name or move.');
            return true;
        }
        else if (name && moveName)
        {
            await interaction.editReply('Cannot look up a pokemon by both name and move at the same time.');
            return true;
        }

        const pokemon = await this.getLookupData({
            name,
            lookupType: RegexLookupType.ExactMatchCaseInsensitive,
            moveName,
            moveListType,
        });

        // TODO: Add listview and final paginated functionality later

        // Get message
        const embeds = (name)
            ? getLookupPokemonEmbedMessages(pokemon)
            : getLookupPokemonByMoveEmbedMessages(pokemon, {
                moveName: moveName as string,
                moveListType,
            });

        return await BaseLookupRespondStrategy.run(interaction, embeds, {
            noEmbedsErrorMessage: 'No pokemon were found.',
        });
    }

    public static async getLookupData({
        name,
        moveName,
        moveListType = PtuMoveListType.All,
        lookupType = RegexLookupType.SubstringCaseInsensitive,
    }: GetLookupPokemonDataParameters = {})
    {
        if (!(name || moveName))
        {
            return [];
        }

        const searchParams = this.parseSearchParameters({
            name,
            moveName,
            moveListType,
            lookupType,
        });

        const { results = [] } = await PokemonController.getAll(searchParams);

        const {
            dexNumbers,
            names,
        } = results.reduce((acc: {
            dexNumbers: string[];
            names: string[];
        }, {
            name,
            metadata: {
                dexNumber,
            },
        }: PtuPokemon) => {
            if (dexNumber)
            {
                acc.dexNumbers.push(dexNumber);
            }

            acc.names.push(name);
            return acc;
        }, {
            dexNumbers: [],
            names: [],
        }) as {
            dexNumbers: string[];
            names: string[];
        };

        // Don't include images for substring searches
        const imageUrlResults = (lookupType !== RegexLookupType.SubstringCaseInsensitive)
            ? await PokeApi.getImageUrls(dexNumbers, names)
            : undefined;

        // Try to add imageUrl to pokemon result
        const pokemon = results.map((result: PtuPokemon) => {
            const {
                name,
                metadata: {
                    dexNumber,
                },
            } = result;

            const { imageUrl } = imageUrlResults?.find((result) =>
                result.id === PokeApi.parseId(dexNumber)
                || result.name === PokeApi.parseName(name)
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

        return {};
    }
}
