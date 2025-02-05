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
import { PtuPokemonCollection } from '../../dal/models/PtuPokemonCollection.js';
import { PokemonController } from '../../dal/PtuController.js';
import {
    getLookupPokemonByAbilityEmbedMessages,
    getLookupPokemonByCapabilityEmbedMessages,
    getLookupPokemonByMoveEmbedMessages,
    getLookupPokemonEmbedMessages,
} from '../../embed-messages/lookup.js';
import { PtuMove } from '../../models/PtuMove.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import { PtuLookupSubcommand } from '../../options/lookup.js';
import { PokeApi } from '../../services/PokeApi.js';
import { removeExtraCharactersFromMoveName } from '../../services/pokemonMoveHelpers.js';
import { PtuAutocompleteParameterName } from '../../types/autocomplete.js';
import {
    PtuAbilityListType,
    PtuMoveListType,
    PtuPokemon,
} from '../../types/pokemon.js';
import { LookupMoveStrategy } from './LookupMoveStrategy.js';

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
    name?: string | null;
    moveName?: string | null;
    pokemon: PtuPokemon[];
    selectedValue?: PtuMoveListType | string;
}

interface GetLookupPokemonEmbedsParameters extends Omit<GetLookupPokemonDataParameters, 'lookupType'>
{
    pokemon: PtuPokemon[];
    moveNameToMovesRecord?: Record<string, PtuMove>;
}

@staticImplements<ChatIteractionStrategy>()
export class LookupPokemonStrategy
{
    public static key: PtuLookupSubcommand.Pokemon = PtuLookupSubcommand.Pokemon;
    private static selectMenuCustomIds = {
        PokemonViewSelect: 'pokemon_view_select',
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
        const includeContestInfo = interaction.options.getBoolean('include_contest_info');

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

        const embedsInput = await this.getFirstEmbedsInput({
            name,
            moveName,
            moveListType,
            abilityName,
            abilityListType,
            capabilityName,
            pokemon: data,
            moveNameToMovesRecord: {},
        }, includeContestInfo);

        // Get message
        const embeds = this.getFirstEmbeds(embedsInput);

        // Send no results found
        if (embeds.length === 0)
        {
            await interaction.editReply('No Pokémon were found.');
            return true;
        }

        // Get selected value (in string select menu, if there is one)
        let selectedValue: string | undefined;

        if (moveName)
        {
            selectedValue = moveListType ?? PtuMoveListType.LevelUp;
        }
        else if (name)
        {
            selectedValue = data[0].versionName;
        }

        await this.sendMessage({
            originalInteraction: interaction,
            interaction,
            embeds,
            name,
            moveName,
            pokemon: data,
            selectedValue,
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
        const results = untypedResults as PtuPokemonCollection[];

        const names = results.map(({ name: pokemonName }) => pokemonName);

        // Don't include images for substring searches
        const imageUrlResults = (name && lookupType !== RegexLookupType.SubstringCaseInsensitive)
            ? await PokeApi.getImageUrls(names)
            : undefined;

        // Try to add imageUrl to pokemon result
        const output = results.map<PtuPokemon>((collection) =>
        {
            const result = collection.toPtuPokemon();
            const { imageUrl } = imageUrlResults?.find(curImageResult =>
                curImageResult.name === PokeApi.parseName(result.name),
            ) ?? {};

            if (!imageUrl)
            {
                return result;
            }

            // Add imageUrl to olderVersions
            const { olderVersions } = result;
            const olderVersionsWithImageUrl = olderVersions?.map((olderVersion) =>
            {
                return {
                    ...olderVersion,
                    metadata: {
                        ...olderVersion.metadata,
                        imageUrl,
                    },
                };
            });
            result.olderVersions = olderVersionsWithImageUrl;

            // Add imageUrl to main version
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

    // Get input for getFirstEmbeds
    private static async getFirstEmbedsInput(
        options: GetLookupPokemonEmbedsParameters,
        includeContestInfo: boolean | null,
    ): Promise<GetLookupPokemonEmbedsParameters>
    {
        const output: GetLookupPokemonEmbedsParameters = {
            ...options,
            moveNameToMovesRecord: {},
        };

        if (includeContestInfo)
        {
            const allMoveNames = output.pokemon.reduce((acc, { moveList }) =>
            {
                const {
                    eggMoves = [],
                    levelUp = [],
                    tmHm = [],
                    tutorMoves = [],
                    zygardeCubeMoves = [],
                } = moveList;

                eggMoves.forEach(eggMove => acc.add(removeExtraCharactersFromMoveName(eggMove)));
                levelUp.forEach(levelUpMove => acc.add(removeExtraCharactersFromMoveName(levelUpMove.move)));
                tmHm.forEach(tmHmMove => acc.add(removeExtraCharactersFromMoveName(tmHmMove)));
                tutorMoves.forEach(tutorMove => acc.add(removeExtraCharactersFromMoveName(tutorMove)));
                zygardeCubeMoves.forEach(zygardeCubeMove => acc.add(removeExtraCharactersFromMoveName(zygardeCubeMove)));

                return acc;
            }, new Set<string>([]));

            const moves = await LookupMoveStrategy.getLookupData({
                names: Array.from(allMoveNames),
            });
            output.moveNameToMovesRecord = moves.reduce<Record<string, PtuMove>>((acc, move) =>
            {
                acc[move.name] = move;
                return acc;
            }, {});
        }

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
        name,
        moveName,
        pokemon,
        interactionType,
        selectedValue,
        isDisabled = false,
    }: {
        originalInteraction: ChatInputCommandInteraction;
        interaction: ChatInputCommandInteraction | StringSelectMenuInteraction;
        embeds: EmbedBuilder[];
        name?: string | null;
        moveName?: string | null;
        pokemon: PtuPokemon[];
        interactionType?: PaginationInteractionType;
        selectedValue?: PtuMoveListType | string;
        isDisabled?: boolean;
    }): Promise<void>
    {
        // Get the select menu based on how the lookup is happening
        let selectMenu: ActionRowBuilder<StringSelectMenuBuilder> | undefined;

        if (name)
        {
            selectMenu = this.getLookupPokemonSelectMenu({
                pokemon,
                isDisabled,
                selectedValue,
            });
        }
        else if (moveName)
        {
            selectMenu = this.getLookupPokemonByMoveSelectMenu({
                defaultMoveListType: selectedValue as PtuMoveListType,
                moveName,
                pokemon,
                isDisabled,
            });
        }

        const rowsAbovePagination: [
            ActionRowBuilder<StringSelectMenuBuilder>?,
        ] = selectMenu
            ? [selectMenu]
            : [];

        // Send messages with pagination (fire and forget)
        const response = await PaginationStrategy.run({
            originalInteraction: interaction,
            commandName: `/ptu ${PtuSubcommandGroup.Lookup} ${PtuLookupSubcommand.Pokemon}`,
            embeds,
            interactionType,
            rowsAbovePagination,
        });

        if (name || moveName)
        {
            // Handle select menu options (fire and forget)
            // eslint-disable-next-line @typescript-eslint/no-floating-promises -- Leave this hanging to free up memory in the node.js event loop.
            this.handleSelectMenuOptions({
                originalInteraction,
                interactionResponse: response,
                name,
                moveName,
                pokemon,
                selectedValue,
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
        moveNameToMovesRecord,
    }: GetLookupPokemonEmbedsParameters): EmbedBuilder[]
    {
        if (name)
        {
            return getLookupPokemonEmbedMessages(pokemon, moveNameToMovesRecord ?? {});
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

    private static getLookupPokemonSelectMenu({
        pokemon,
        isDisabled,
        selectedValue,
    }: {
        pokemon: PtuPokemon[];
        isDisabled: boolean;
        selectedValue?: string;
    }): ActionRowBuilder<StringSelectMenuBuilder> | undefined
    {
        // Get select menu options
        const options = pokemon.reduce<StringSelectMenuOptionBuilder[]>((acc, { versionName: newestVersionName, olderVersions = [] }) =>
        {
            if (olderVersions.length === 0)
            {
                return acc;
            }

            const newestOption = new StringSelectMenuOptionBuilder()
                .setLabel(newestVersionName)
                .setValue(newestVersionName)
                .setDefault(selectedValue === newestVersionName || selectedValue === undefined);
            acc.push(newestOption);

            olderVersions.forEach(({ versionName }) =>
            {
                const option = new StringSelectMenuOptionBuilder()
                    .setLabel(versionName)
                    .setValue(versionName);

                if (selectedValue === versionName)
                {
                    option.setDefault(true);
                }

                acc.push(option);
            });

            return acc;
        }, []);

        // Only show the select menu if there's 2 or more options to show
        if (options.length <= 1)
        {
            return undefined;
        }

        // Create select menus
        let optionsInCurSelectMenu = 0;
        let curMenu = new StringSelectMenuBuilder()
            .setCustomId(`${this.selectMenuCustomIds.PokemonViewSelect}_${optionsInCurSelectMenu}`)
            .setDisabled(isDisabled);
        const selectMenus = options.reduce<StringSelectMenuBuilder[]>((acc, option, index) =>
        {
            curMenu.addOptions(option);
            optionsInCurSelectMenu += 1;

            // Comply with Discord's 5 options per menu limit & add the menu after the last option
            if (optionsInCurSelectMenu === 5 || index === options.length - 1)
            {
                acc.push(curMenu);
                optionsInCurSelectMenu = 0;
                curMenu = new StringSelectMenuBuilder()
                    .setCustomId(`${this.selectMenuCustomIds.PokemonViewSelect}_${optionsInCurSelectMenu}`)
                    .setDisabled(isDisabled);
            }

            return acc;
        }, []);

        // Add the select menus to the row
        const row = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(...selectMenus);

        return row;
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
        name,
        moveName,
        pokemon,
        selectedValue,
    }: HandleSelectMenuOptionsParameters): Promise<void>
    {
        let embeds: EmbedBuilder[] = [];
        let hasUpdated = false;

        try
        {
            const responseInteraction = await interactionResponse.awaitMessageComponent({
                componentType: ComponentType.StringSelect,
                time: timeToWaitForCommandInteractions,
            });

            const { customId, values = [] } = responseInteraction;
            const [value] = values;

            if (customId.includes(this.selectMenuCustomIds.PokemonViewSelect))
            {
                // Create a map of version name to pokemon
                const [onlyPokemon] = pokemon;
                const { olderVersions = [] } = onlyPokemon;
                const versionNameToPokemon: Record<string, PtuPokemon> = {
                    [onlyPokemon.versionName]: onlyPokemon,
                };

                olderVersions.forEach((curPokemon) =>
                {
                    const { versionName } = curPokemon;

                    versionNameToPokemon[versionName] = {
                        name: onlyPokemon.name,
                        ...curPokemon,
                    };
                });

                embeds = this.getLookupPokemonEmbeds({
                    name,
                    pokemon: [versionNameToPokemon[value]],
                });

                hasUpdated = true;

                await this.sendMessage({
                    originalInteraction,
                    interaction: responseInteraction,
                    embeds,
                    name,
                    moveName,
                    pokemon,
                    interactionType: 'update',
                    selectedValue: value,
                });
            }
            else if (customId === this.selectMenuCustomIds.MoveViewSelect)
            {
                const moveListType = value as PtuMoveListType;
                embeds = this.getLookupPokemonEmbeds({
                    moveName,
                    moveListType,
                    pokemon,
                });

                hasUpdated = true;

                await this.sendMessage({
                    originalInteraction,
                    interaction: responseInteraction,
                    embeds,
                    name,
                    moveName,
                    pokemon,
                    interactionType: 'update',
                    selectedValue: moveListType,
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
                await this.sendMessage({
                    originalInteraction,
                    interaction: originalInteraction,
                    embeds,
                    name,
                    moveName,
                    pokemon,
                    interactionType: 'editReply',
                    selectedValue,
                    isDisabled: true,
                });
            }
        }
    }
}
