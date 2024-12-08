import { logger } from '@beanc16/logger';
import type { Entries } from '@beanc16/utility-types';
import {
    ActionRowBuilder,
    ChatInputCommandInteraction,
    ComponentType,
    EmbedBuilder,
    Message,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
    StringSelectMenuOptionBuilder,
} from 'discord.js';

import { timeToWaitForCommandInteractions } from '../../../../constants/discord.js';
import { staticImplements } from '../../../../decorators/staticImplements.js';
import { parseRegexByType, RegexLookupType } from '../../../../services/stringHelpers.js';
import { PaginationInteractionType, PaginationStrategy } from '../../../strategies/PaginationStrategy.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { PokemonController } from '../../dal/PtuController.js';
import {
    getLookupPokemonByAbilityEmbedMessages,
    getLookupPokemonByCapabilityEmbedMessages,
    getLookupPokemonByMoveEmbedMessages,
    getLookupPokemonEmbedMessages,
} from '../../embed-messages/lookup.js';
import { PokeApi } from '../../services/PokeApi.js';
import { PtuLookupSubcommand } from '../../subcommand-groups/lookup.js';
import { PtuAutocompleteParameterName } from '../../types/autocomplete.js';
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
    capabilityName?: string | null;
}

export interface HandleSelectMenuOptionsParameters
{
    originalInteraction: ChatInputCommandInteraction;
    interactionResponse: Message<boolean>;
    moveName: string;
    pokemon: PtuPokemon[];
    currentMoveListType: PtuMoveListType;
}

interface GetLookupPokemonEmbedsParameters extends Omit<GetLookupPokemonDataParameters, 'lookupType'>
{
    pokemon: PtuPokemon[];
}

@staticImplements<ChatIteractionStrategy>()
export class LookupPokemonStrategy
{
    public static key: PtuLookupSubcommand.Pokemon = PtuLookupSubcommand.Pokemon;
    private static selectMenuCustomIds = {
        MoveViewSelect: 'move_view_select',
    };

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString(PtuAutocompleteParameterName.PokemonName);
        const moveName = interaction.options.getString(PtuAutocompleteParameterName.MoveName);
        const moveListType = (interaction.options.getString('move_list_type') ?? PtuMoveListType.All) as PtuMoveListType;
        const abilityName = interaction.options.getString(PtuAutocompleteParameterName.AbilityName);
        const abilityListType = (interaction.options.getString('ability_list_type') ?? PtuAbilityListType.All) as PtuAbilityListType;
        const capabilityName = interaction.options.getString(PtuAutocompleteParameterName.CapabilityName);

        const numOfTruthyValues = [name, moveName, abilityName, capabilityName].filter(Boolean).length;
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

        const data = await this.getLookupData({
            name,
            lookupType: RegexLookupType.ExactMatchCaseInsensitive,
            moveName,
            moveListType,
            abilityName,
            abilityListType,
            capabilityName,
        });

        // Get message
        const embeds = this.getFirstEmbeds({
            name,
            moveName,
            moveListType,
            abilityName,
            abilityListType,
            capabilityName,
            pokemon: data,
        });

        // Send no results found
        if (embeds.length === 0)
        {
            await interaction.editReply('No Pokémon were found.');
            return true;
        }

        await this.sendMessage({
            originalInteraction: interaction,
            interaction,
            embeds,
            moveName,
            pokemon: data,
            defaultMoveListType: PtuMoveListType.LevelUp,
        });

        return true;
    }

    public static async getLookupData({
        name,
        lookupType = RegexLookupType.SubstringCaseInsensitive,
        moveName,
        moveListType = PtuMoveListType.All,
        abilityName,
        abilityListType = PtuAbilityListType.All,
        capabilityName,
    }: GetLookupPokemonDataParameters = {}): Promise<PtuPokemon[]>
    {
        if (!(name || moveName || abilityName || capabilityName))
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
            capabilityName,
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
        const output = results.map((result) =>
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
        output.sort((a, b) => a.name.localeCompare(b.name));

        return output;
    }

    // Get embeds for the very first message
    private static getFirstEmbeds(options: GetLookupPokemonEmbedsParameters): EmbedBuilder[]
    {
        // Searching by move name on all move types
        if (!!options.moveName && options.moveListType === PtuMoveListType.All)
        {
            // Find the embeds of the first move type in this order
            const moveListTypes: Exclude<PtuMoveListType, PtuMoveListType.All>[] = [
                PtuMoveListType.LevelUp,
                PtuMoveListType.TmHm,
                PtuMoveListType.EggMoves,
                PtuMoveListType.TutorMoves,
                PtuMoveListType.ZygardeCubeMoves,
            ];

            // eslint-disable-next-line no-restricted-syntax -- Allow this for early returning
            for (const moveListType of moveListTypes)
            {
                const embeds = this.getLookupPokemonEmbeds({
                    ...options,
                    moveListType,
                });

                if (embeds.length > 0)
                {
                    return embeds;
                }
            }
        }

        return this.getLookupPokemonEmbeds(options);
    }

    private static async sendMessage({
        originalInteraction,
        interaction,
        embeds,
        moveName,
        pokemon,
        interactionType,
        defaultMoveListType,
        isDisabled = false,
    }: {
        originalInteraction: ChatInputCommandInteraction;
        interaction: ChatInputCommandInteraction | StringSelectMenuInteraction;
        embeds: EmbedBuilder[];
        moveName?: string | null;
        pokemon: PtuPokemon[];
        interactionType?: PaginationInteractionType;
        defaultMoveListType: PtuMoveListType;
        isDisabled?: boolean;
    }): Promise<void>
    {
        // Only get the select menu for looking up by move name
        const selectMenu = moveName
            ? this.getLookupPokemonByMoveSelectMenu({
                defaultMoveListType,
                moveName,
                pokemon,
                isDisabled,
            })
            : undefined;

        const rowsAbovePagination: [
            ActionRowBuilder<StringSelectMenuBuilder>?,
        ] = selectMenu
            ? [selectMenu]
            : [];

        // Send messages with pagination (fire and forget)
        const response = await PaginationStrategy.run({
            originalInteraction: interaction,
            embeds,
            interactionType,
            rowsAbovePagination,
        });

        if (moveName)
        {
            // Handle select menu options (fire and forget)
            // eslint-disable-next-line @typescript-eslint/no-floating-promises -- Leave this hanging to free up memory in the node.js event loop.
            this.handleSelectMenuOptions({
                originalInteraction,
                interactionResponse: response,
                moveName,
                pokemon,
                currentMoveListType: defaultMoveListType,
            });
        }
    }

    private static parseSearchParameters({
        name,
        moveName,
        moveListType = PtuMoveListType.All,
        lookupType = RegexLookupType.SubstringCaseInsensitive,
        abilityName,
        abilityListType = PtuAbilityListType.All,
        capabilityName,
    }: GetLookupPokemonDataParameters = {}): Record<string, string | RegExp | object | object[] | undefined>
    {
        if (name)
        {
            return {
                name: parseRegexByType(name, lookupType),
            };
        }

        if (capabilityName)
        {
            return {
                'capabilities.other': {
                    $in: [
                        parseRegexByType(capabilityName, lookupType),
                    ],
                },
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
        capabilityName,
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

        if (capabilityName)
        {
            return getLookupPokemonByCapabilityEmbedMessages(pokemon, {
                capabilityName,
            });
        }

        return [];
    }

    private static getLookupPokemonByMoveSelectMenu({
        defaultMoveListType,
        moveName,
        pokemon,
        isDisabled,
    }: {
        defaultMoveListType: PtuMoveListType;
        moveName: string;
        pokemon: PtuPokemon[];
        isDisabled: boolean;
    }): ActionRowBuilder<StringSelectMenuBuilder> | undefined
    {
        type MoveListTypeToChoiceName = Record<Exclude<PtuMoveListType, PtuMoveListType.All>, string>;
        const moveListTypeToChoiceName: MoveListTypeToChoiceName = {
            [PtuMoveListType.LevelUp]: 'Level Up Moves',
            [PtuMoveListType.TmHm]: 'TM/HM Moves',
            [PtuMoveListType.EggMoves]: 'Egg Moves',
            [PtuMoveListType.TutorMoves]: 'Tutor Moves',
            [PtuMoveListType.ZygardeCubeMoves]: 'Zygarde Cube Moves',
        };

        // Figure out what types of moves all pokemon have at least one of
        const shouldInclude = pokemon.reduce<
            Record<Exclude<PtuMoveListType, PtuMoveListType.All>, boolean>
        >((acc, {
            moveList: {
                levelUp,
                eggMoves,
                tmHm,
                tutorMoves,
                zygardeCubeMoves = [],
            },
        }) =>
        {
            const hasAsLevelUpMove = !!levelUp.find(({ move }) => move === moveName);
            const hasAsTmHmMove = !!tmHm.find(move => move.toLowerCase().includes(moveName.toLowerCase()));
            const hasAsEggMove = !!eggMoves.find(move => move === moveName);
            const hasAsTutorMove = !!tutorMoves.find(move => move === moveName);
            const hasAsZygardeCubeMove = !!zygardeCubeMoves.find(move => move === moveName);

            return {
                [PtuMoveListType.LevelUp]: acc[PtuMoveListType.LevelUp] || hasAsLevelUpMove,
                [PtuMoveListType.TmHm]: acc[PtuMoveListType.TmHm] || hasAsTmHmMove,
                [PtuMoveListType.EggMoves]: acc[PtuMoveListType.EggMoves] || hasAsEggMove,
                [PtuMoveListType.TutorMoves]: acc[PtuMoveListType.TutorMoves] || hasAsTutorMove,
                [PtuMoveListType.ZygardeCubeMoves]: acc[PtuMoveListType.ZygardeCubeMoves] || hasAsZygardeCubeMove,
            };
        }, {
            [PtuMoveListType.LevelUp]: false,
            [PtuMoveListType.TmHm]: false,
            [PtuMoveListType.EggMoves]: false,
            [PtuMoveListType.TutorMoves]: false,
            [PtuMoveListType.ZygardeCubeMoves]: false,
        });

        // Get select menu options
        const options = (
            Object.entries(moveListTypeToChoiceName) as Entries<MoveListTypeToChoiceName>
        ).reduce<StringSelectMenuOptionBuilder[]>((acc, [moveListType, choiceName]) =>
        {
            if (!shouldInclude[moveListType])
            {
                return acc;
            }

            const option = new StringSelectMenuOptionBuilder()
                .setLabel(choiceName)
                .setValue(moveListType);

            if (moveListType === defaultMoveListType)
            {
                option.setDefault(true);
            }

            acc.push(option);
            return acc;
        }, []);

        // Only show the select menu if there's 2 or more options to show
        if (options.length <= 1)
        {
            return undefined;
        }

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(this.selectMenuCustomIds.MoveViewSelect)
            .addOptions(...options)
            .setDisabled(isDisabled);

        const row = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(selectMenu);

        return row;
    }

    private static async handleSelectMenuOptions({
        originalInteraction,
        interactionResponse,
        moveName,
        pokemon,
        currentMoveListType,
    }: HandleSelectMenuOptionsParameters): Promise<void>
    {
        let hasUpdated = false;

        try
        {
            const responseInteraction = await interactionResponse.awaitMessageComponent({
                componentType: ComponentType.StringSelect,
                time: timeToWaitForCommandInteractions,
            });

            const { customId, values = [] } = responseInteraction;
            const [moveListType] = values as PtuMoveListType[];

            if (customId === this.selectMenuCustomIds.MoveViewSelect)
            {
                const embeds = this.getLookupPokemonEmbeds({
                    moveName,
                    moveListType,
                    pokemon,
                });

                hasUpdated = true;

                await this.sendMessage({
                    originalInteraction,
                    interaction: responseInteraction,
                    embeds,
                    moveName,
                    pokemon,
                    interactionType: 'update',
                    defaultMoveListType: moveListType,
                });
            }
        }

        catch (error)
        {
            const errorPrefix = 'Collector received no interactions before ending with reason:';
            const messageTimedOut = (error as Error).message.includes(`${errorPrefix} time`);
            const messageWasDeleted = (error as Error).message.includes(`${errorPrefix} messageDelete`);

            // Ignore timeouts
            if (!messageTimedOut && !messageWasDeleted)
            {
                logger.error('An unknown error occurred whilst handling select menu interactions on /ptu lookup pokemon', error);
            }

            // Disable select menu upon timeout or delete
            if (!hasUpdated && !messageWasDeleted)
            {
                const embeds = this.getLookupPokemonEmbeds({
                    moveName,
                    moveListType: currentMoveListType,
                    pokemon,
                });

                await this.sendMessage({
                    originalInteraction,
                    interaction: originalInteraction,
                    embeds,
                    moveName,
                    pokemon,
                    interactionType: 'editReply',
                    defaultMoveListType: currentMoveListType,
                    isDisabled: true,
                });
            }
        }
    }
}
