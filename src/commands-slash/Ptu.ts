import { BaseSlashCommand } from '@beanc16/discordjs-common-commands';
import { ApplicationCommandOptionChoiceData, AutocompleteInteraction, ChatInputCommandInteraction } from 'discord.js';

import * as options from './options';
import { CachedGoogleSheetsApiService } from '../services/CachedGoogleSheetsApiService';
import { PtuSubcommandGroup } from './options/subcommand-groups';
import { BerryTier, HealingAndStatusOption, PtuRandomSubcommand } from './options/subcommand-groups/ptu/random';
import { DiceLiteService } from '../services/DiceLiteService';
import { getRandomYouFoundNothingEmbedMessage, getRandomPokeballEmbedMessage, getRandomResultEmbedMessage, getRandomDowsingRodEmbedMessage } from './embed-messages/ptu/random';
import { PokemonMoveCategory, PokemonType, PtuMoveFrequency } from '../constants/pokemon';
import { PtuLookupSubcommand } from './options/subcommand-groups/ptu/lookup';
import { EqualityOption } from './options/shared';
import { PtuMove, PtuMoveExclude } from '../models/PtuMove';
import { getLookupAbilitiesEmbedMessages, getLookupMovesEmbedMessages } from './embed-messages/ptu/lookup';
import { PtuAbilitiesSearchService, PtuMovesSearchService } from '../services/SearchService';
import { MAX_AUTOCOMPLETE_CHOICES } from '../constants/discord';
import { PtuAbility } from '../models/PtuAbility';
import { SubcommandHandlerFunction } from '../types/common';

enum HealingItemTypes
{
    Healing = 'Healing',
    Status = 'Status',
}

enum HeldItemTypes
{
    Normal = 'Normal',
    Mega = 'Mega',
}

enum PokeballType
{
    Normal = 'Normal',
    Special = 'Special',
    Safari = 'Safari',
    Jailbreaker = 'Jailbreaker Ball',
    Case = 'Jailbreaker Case',
    Attachment = 'Jailbreaker Attachment',
    Master = 'Master',
}

type SubcommandHandlers = {
    [PtuSubcommandGroup.Lookup]: {
        [key in PtuLookupSubcommand]: SubcommandHandlerFunction
    };
    [PtuSubcommandGroup.Random]: {
        [key in PtuRandomSubcommand]: SubcommandHandlerFunction
    };
}

export interface RandomResult
{
    name: string;
    cost?: string;
    description: string;
    numOfTimesRolled?: number;
}

export interface RandomPokeball extends RandomResult
{
    mod?: string;
    type?: string;
    jailBreakerInfo?: RandomPokeball;
}

interface StringsForSubcommand {
    data: string;
    plural: string;
}

type SubcommandToStrings = {
    [key in PtuRandomSubcommand]: StringsForSubcommand;
};

const subcommandToStrings: SubcommandToStrings = {
    [PtuRandomSubcommand.Apricorn]: {
        data: 'Apricorn',
        plural: 'Apricorns',
    },
    [PtuRandomSubcommand.Berry]: {
        data: 'Berry',
        plural: 'Berries',
    },
    [PtuRandomSubcommand.DowsingRod]: {
        data: 'Dowsing Rod Shard',
        plural: 'Dowsing Rod Shards',
    },
    [PtuRandomSubcommand.EvolutionaryStone]: {
        data: 'Evolutionary Stone',
        plural: 'Evolutionary Stones',
    },
    [PtuRandomSubcommand.HealingItem]: {
        data: 'Healing Item',
        plural: 'Healing Items',
    },
    [PtuRandomSubcommand.HeldItem]: {
        data: 'Held Item',
        plural: 'Held Items',
    },
    [PtuRandomSubcommand.Metronome]: {
        data: 'Moves',
        plural: 'Metronomes',
    },
    [PtuRandomSubcommand.Pickup]: {
        data: 'Pickup',
        plural: 'Pickups',
    },
    [PtuRandomSubcommand.Pokeball]: {
        data: 'Pokeball',
        plural: 'Pokeballs',
    },
    [PtuRandomSubcommand.XItem]: {
        data: 'X-Item',
        plural: 'X-Items',
    },
    [PtuRandomSubcommand.TM]: {
        data: 'TM',
        plural: 'TMs',
    },
    [PtuRandomSubcommand.Vitamin]: {
        data: 'Vitamin',
        plural: 'Vitamins',
    },
};

// TODO: Probably move all random things to their own file?
const subcommandHandlerForRandom = async (interaction: ChatInputCommandInteraction, subcommand: PtuRandomSubcommand) => {
    // Get parameter results
    const numberOfDice = interaction.options.getInteger('number_of_dice') as number;

    // Pull data from spreadsheet
    const { data = [] } = await CachedGoogleSheetsApiService.getRange({
        // TODO: Make this spreadsheet id a constant later
        spreadsheetId: '12_3yiG7PWWnm0UZm8enUcjLd0f4i3XoZQBpkGCHfKJI',
        range: `'${subcommandToStrings[subcommand].data} Data'!A2:D`,
    });

    // Parse data
    const parsedData = data.reduce((acc, [name, cost, description]) => {
        acc.push({
            name,
            cost,
            description,
        });
        return acc;
    }, [] as RandomResult[]);

    // Get random numbers
    const rollResult = new DiceLiteService({
        count: numberOfDice,
        sides: parsedData.length,
    }).roll();
    const rollResults = rollResult.join(', ');

    // Combine numbers to be unique
    const uniqueRolls = rollResult.reduce((acc, cur) => {
        const index = acc.findIndex(({ result }) => result === cur);

        // Increment the number of times rolled
        if (index >= 0)
        {
            acc[index].numOfTimesRolled += 1;
        }

        // Add to array for the first time
        else
        {
            acc.push({
                result: cur,
                numOfTimesRolled: 1,
            });
        }

        return acc;
    }, [] as {
        result: number;
        numOfTimesRolled: number;
    }[]);

    // Get random items based on rolls
    const results = uniqueRolls.map(({ result, numOfTimesRolled }) => {
        return {
            ...parsedData[result - 1],
            numOfTimesRolled,
        };
    });

    // Get embed message
    const embed = getRandomResultEmbedMessage({
        itemNamePluralized: subcommandToStrings[subcommand].plural,
        results,
        rollResults,
    });

    // Send embed
    await interaction.editReply({
        embeds: [embed],
    });

    return true;
};

export interface GetLookupAbilityDataParameters {
    name?: string | null;
    nameSearch?: string | null;
    frequencySearch?: string | null;
    effectSearch?: string | null;
}

export interface GetLookupMoveDataParameters {
    name?: string | null;
    type?: PokemonType | null;
    category?: PokemonMoveCategory | null;
    db?: number | null;
    dbEquality?: EqualityOption | null;
    frequency?: PtuMoveFrequency | null;
    ac?: number | null;
    acEquality?: EqualityOption | null;
    nameSearch?: string | null;
    rangeSearch?: string | null;
    effectSearch?: string | null;
    exclude?: PtuMoveExclude;
}

const getLookupAbilityData = async (input: GetLookupAbilityDataParameters = {}) =>
{
    const { data = [] } = await CachedGoogleSheetsApiService.getRange({
        spreadsheetId: '12_3yiG7PWWnm0UZm8enUcjLd0f4i3XoZQBpkGCHfKJI', // TODO: Make this a constant at some point
        range: `'Abilities Data'!A3:Z`,
    });

    const abilities = data.reduce((acc, cur) =>
    {
        const ability = new PtuAbility(cur);

        if (!ability.IsValidBasedOnInput(input))
        {
            return acc;
        }

        acc.push(ability);

        return acc;
    }, [] as PtuAbility[]);

    // Sort manually if there's no searches
    if (input.nameSearch || input.effectSearch)
    {
        const results = PtuAbilitiesSearchService.search(abilities, input);
        return results;
    }

    abilities.sort((a, b) =>
    {
        /*
         * Sort by:
         * 1) Name
         */
        return a.name.localeCompare(b.name);
    });
    return abilities;
};

const getLookupMoveData = async (input: GetLookupMoveDataParameters = {}) =>
{
    const { data = [] } = await CachedGoogleSheetsApiService.getRange({
        spreadsheetId: '12_3yiG7PWWnm0UZm8enUcjLd0f4i3XoZQBpkGCHfKJI', // TODO: Make this a constant at some point
        range: `'Moves Data'!A3:Z`,
    });

    let beyondWeaponMovesAndManuevers = false;
    const moves = data.reduce((acc, cur) =>
    {
        const move = new PtuMove(cur);

        if (!move.ShouldIncludeInOutput())
        {
            return acc;
        }

        if (!move.IsValidBasedOnInput(input))
        {
            return acc;
        }

        // Assume Arcane Fury marks the start of weapon moves, which are above maneuvers
        if (move.name === 'Arcane Fury')
        {
            beyondWeaponMovesAndManuevers = true;
        }

        if (beyondWeaponMovesAndManuevers && input?.exclude?.weaponMovesAndManuevers)
        {
            return acc;
        }

        acc.push(move);

        return acc;
    }, [] as PtuMove[]);

    // Sort manually if there's no searches
    if (input.nameSearch || input.effectSearch)
    {
        const results = PtuMovesSearchService.search(moves, input);
        return results;
    }

    moves.sort((a, b) =>
    {
        /*
         * Sort by:
         * 1) Type
         * 2) Name
         */
        return a.type?.localeCompare(b.type ?? '')
            || a.name.localeCompare(b.name);
    });
    return moves;
};

class Ptu extends BaseSlashCommand
{
    constructor()
    {
        super();
        this._slashCommandData
            .addSubcommandGroup(options.subcommandGroups.lookup)
            .addSubcommandGroup(options.subcommandGroups.random);
    }

    // TODO: Convert subcommand handlers to a strategy pattern with classes later.

    private lookupSubcommandHandlers: SubcommandHandlers[PtuSubcommandGroup.Lookup] = {
        // TODO: Add here later
        [PtuLookupSubcommand.Ability]: async (interaction: ChatInputCommandInteraction) =>
        {
            // Get parameter results
            const name = interaction.options.getString('ability_name');
            const nameSearch = interaction.options.getString('name_search');
            const frequencySearch = interaction.options.getString('frequency_search');
            const effectSearch = interaction.options.getString('effect_search');

            const abilities = await getLookupAbilityData({
                name,
                nameSearch,
                frequencySearch,
                effectSearch,
            });

            // TODO: Add listview and final paginated functionality later

            // Get message
            const embeds = getLookupAbilitiesEmbedMessages(abilities);

            // Send no results found
            if (embeds.length === 0)
            {
                await interaction.editReply('No abilities were found.');
                return true;
            }

            // Send embed
            await interaction.editReply({
                embeds: [embeds[0]],
            });

            // Reply to the original message with all embeds after the first
            for (const embed of embeds.slice(1))
            {
                await interaction.followUp({
                    embeds: [embed],
                });
            }

            return true;
        },
        [PtuLookupSubcommand.Move]: async (interaction: ChatInputCommandInteraction) =>
        {
            // Get parameter results
            const name = interaction.options.getString('move_name');
            const type = interaction.options.getString('type') as PokemonType | null;
            const category = interaction.options.getString('category') as PokemonMoveCategory | null;
            const db = interaction.options.getInteger('damage_base');
            const dbEquality = interaction.options.getString('damage_base_equality') as EqualityOption;
            const frequency = interaction.options.getString('frequency') as PtuMoveFrequency | null;
            const ac = interaction.options.getInteger('ac');
            const acEquality = interaction.options.getString('ac_equality') as EqualityOption;
            const nameSearch = interaction.options.getString('name_search');
            const rangeSearch = interaction.options.getString('range_search');
            const effectSearch = interaction.options.getString('effect_search');

            const moves = await getLookupMoveData({
                name,
                type,
                category,
                db,
                dbEquality,
                frequency,
                ac,
                acEquality,
                nameSearch,
                rangeSearch,
                effectSearch,
            });

            // TODO: Add listview and final paginated functionality later

            // Get message
            const embeds = getLookupMovesEmbedMessages(moves);

            // Send no results found
            if (embeds.length === 0)
            {
                await interaction.editReply('No moves were found.');
                return true;
            }

            // Send embed
            await interaction.editReply({
                embeds: [embeds[0]],
            });

            // Reply to the original message with all embeds after the first
            for (const embed of embeds.slice(1))
            {
                await interaction.followUp({
                    embeds: [embed],
                });
            }

            return true;
        },
    };

    private randomSubcommandHandlers: SubcommandHandlers[PtuSubcommandGroup.Random] = {
        // TODO: DRY this out later so stuff can be shared
        [PtuRandomSubcommand.Apricorn]: async (interaction: ChatInputCommandInteraction) =>
        {
            // Get parameter results
            const survivalRank = interaction.options.getInteger('survival_rank') as number;
            // const numberOfIterations = interaction.options.getInteger('number_of_iterations') || 1;

            const { data = [] } = await CachedGoogleSheetsApiService.getRange({
                // TODO: Make this spreadsheet id a constant later
                spreadsheetId: '12_3yiG7PWWnm0UZm8enUcjLd0f4i3XoZQBpkGCHfKJI',
                range: `'${subcommandToStrings[PtuRandomSubcommand.Apricorn].data} Data'!A2:D`,
            });

            // TODO: Make this parser customizable to DRY out later
            // Parse the data
            const parsedData = data.reduce((acc, [name, pokeball]) => {
                acc.push({
                    name,
                    description: pokeball,
                });
                return acc;
            }, [] as RandomResult[]);

            // Get random numbers
            const rollResult = new DiceLiteService({
                count: survivalRank,
                sides: parsedData.length,
            }).roll();
            const rollResults = rollResult.join(', ');

            const uniqueRolls = rollResult.reduce((acc, cur) => {
                const index = acc.findIndex(({ result }) => result === cur);

                if (index >= 0)
                {
                    acc[index].numOfTimesRolled += 1;
                }
                else
                {
                    acc.push({
                        result: cur,
                        numOfTimesRolled: 1,
                    });
                }

                return acc;
            }, [] as {
                result: number;
                numOfTimesRolled: number;
            }[]);

            // Get random items
            const results = uniqueRolls.map(({ result, numOfTimesRolled }) => {
                return {
                    ...parsedData[result - 1],
                    numOfTimesRolled,
                };
            });

            // Get message
            const embed = getRandomResultEmbedMessage({
                itemNamePluralized: subcommandToStrings[PtuRandomSubcommand.Apricorn].plural,
                results,
                rollResults,
            });

            // Send embed
            await interaction.editReply({
                embeds: [embed],
            });

            return true;
        },
        // TODO: DRY this out later so stuff can be shared
        [PtuRandomSubcommand.Berry]: async (interaction: ChatInputCommandInteraction) =>
        {
            // Get parameter results
            const numberOfDice = interaction.options.getInteger('number_of_dice') as number;
            const inputTier = interaction.options.getString('berry_tier') || BerryTier.OnePlus;

            const { data = [] } = await CachedGoogleSheetsApiService.getRange({
                // TODO: Make this spreadsheet id a constant later
                spreadsheetId: '12_3yiG7PWWnm0UZm8enUcjLd0f4i3XoZQBpkGCHfKJI',
                range: `'${subcommandToStrings[PtuRandomSubcommand.Berry].data} Data'!A2:D`,
            });

            // TODO: Move helper elsewhere in the future
            const shouldInclude = ({ inputTier, tier }: { inputTier: string, tier: number }) =>
            {
                if (inputTier === BerryTier.OnePlus && tier >= 1) return true;
                if (inputTier === BerryTier.One && tier === 1) return true;
                if (inputTier === BerryTier.TwoPlus && tier >= 2) return true;
                if (inputTier === BerryTier.Two && tier === 2) return true;
                if (inputTier === BerryTier.Three && tier === 3) return true;
                return false;
            };

            // Parse the data
            const parsedData = data.reduce((acc, [name, cost, unparsedTier, description]) => {
                const tier = parseInt(unparsedTier, 10);

                // TODO: Make this a generic "shouldInclude" function later to DRY
                if (shouldInclude({ inputTier, tier }))
                {
                    acc.push({
                        name,
                        cost,
                        description,
                    });
                }

                return acc;
            }, [] as RandomResult[]);

            // Get random numbers
            const rollResult = new DiceLiteService({
                count: numberOfDice,
                sides: parsedData.length,
            }).roll();
            const rollResults = rollResult.join(', ');

            const uniqueRolls = rollResult.reduce((acc, cur) => {
                const index = acc.findIndex(({ result }) => result === cur);

                if (index >= 0)
                {
                    acc[index].numOfTimesRolled += 1;
                }
                else
                {
                    acc.push({
                        result: cur,
                        numOfTimesRolled: 1,
                    });
                }

                return acc;
            }, [] as {
                result: number;
                numOfTimesRolled: number;
            }[]);

            // Get random items
            const results = uniqueRolls.map(({ result, numOfTimesRolled }) => {
                return {
                    ...parsedData[result - 1],
                    numOfTimesRolled,
                };
            });

            // Get message
            const embed = getRandomResultEmbedMessage({
                itemNamePluralized: subcommandToStrings[PtuRandomSubcommand.Berry].plural,
                results,
                rollResults,
            });

            // Send embed
            await interaction.editReply({
                embeds: [embed],
            });

            return true;
        },
        [PtuRandomSubcommand.EvolutionaryStone]: async (interaction: ChatInputCommandInteraction) =>
            subcommandHandlerForRandom(interaction, PtuRandomSubcommand.EvolutionaryStone),
        // TODO: DRY this out later so stuff can be shared
        [PtuRandomSubcommand.HealingItem]: async (interaction: ChatInputCommandInteraction) =>
        {
            // Get parameter results
            const numberOfDice = interaction.options.getInteger('number_of_dice') as number;
            const inputType = interaction.options.getString('type') || HealingAndStatusOption.HealingAndStatus;

            const { data = [] } = await CachedGoogleSheetsApiService.getRange({
                // TODO: Make this spreadsheet id a constant later
                spreadsheetId: '12_3yiG7PWWnm0UZm8enUcjLd0f4i3XoZQBpkGCHfKJI',
                range: `'${subcommandToStrings[PtuRandomSubcommand.HealingItem].data} Data'!A2:D`,
            });

            // TODO: Move helper elsewhere in the future
            const shouldInclude = ({ inputType, type }: { inputType: string, type: string }) =>
            {
                if (inputType === HealingAndStatusOption.HealingAndStatus) return true;
                if (inputType === HealingAndStatusOption.Healing && type === HealingItemTypes.Healing) return true;
                if (inputType === HealingAndStatusOption.Status && type === HealingItemTypes.Status) return true;
                return false;
            };

            // TODO: Make this parser customizable to DRY out later
            // Parse the data
            const parsedData = data.reduce((acc, [name, cost, type, description]) => {
                // TODO: Make this a generic "shouldInclude" function later to DRY
                if (shouldInclude({ inputType, type }))
                {
                    acc.push({
                        name,
                        cost,
                        description,
                    });
                }

                return acc;
            }, [] as RandomResult[]);

            // Get random numbers
            const rollResult = new DiceLiteService({
                count: numberOfDice,
                sides: parsedData.length,
            }).roll();
            const rollResults = rollResult.join(', ');

            const uniqueRolls = rollResult.reduce((acc, cur) => {
                const index = acc.findIndex(({ result }) => result === cur);

                if (index >= 0)
                {
                    acc[index].numOfTimesRolled += 1;
                }
                else
                {
                    acc.push({
                        result: cur,
                        numOfTimesRolled: 1,
                    });
                }

                return acc;
            }, [] as {
                result: number;
                numOfTimesRolled: number;
            }[]);

            // Get random items
            const results = uniqueRolls.map(({ result, numOfTimesRolled }) => {
                return {
                    ...parsedData[result - 1],
                    numOfTimesRolled,
                };
            });

            // Get message
            const embed = getRandomResultEmbedMessage({
                itemNamePluralized: subcommandToStrings[PtuRandomSubcommand.HealingItem].plural,
                results,
                rollResults,
            });

            // Send embed
            await interaction.editReply({
                embeds: [embed],
            });

            return true;
        },
        // TODO: DRY this out later so stuff can be shared
        [PtuRandomSubcommand.HeldItem]: async (interaction: ChatInputCommandInteraction) =>
        {
            // Get parameter results
            const numberOfDice = interaction.options.getInteger('number_of_dice') as number;
            const includeMega = interaction.options.getBoolean('include_mega') || false;

            const { data = [] } = await CachedGoogleSheetsApiService.getRange({
                // TODO: Make this spreadsheet id a constant later
                spreadsheetId: '12_3yiG7PWWnm0UZm8enUcjLd0f4i3XoZQBpkGCHfKJI',
                range: `'${subcommandToStrings[PtuRandomSubcommand.HeldItem].data} Data'!A2:D`,
            });

            // TODO: Move helper elsewhere in the future
            const shouldInclude = ({ type, includeMega }: { type: string, includeMega: boolean }) =>
            {
                if (type === HeldItemTypes.Normal) return true;
                if (type === HeldItemTypes.Mega && includeMega) return true;
                return false;
            };

            // TODO: Make this parser customizable to DRY out later
            // Parse the data
            const parsedData = data.reduce((acc, [name, cost, type, description]) => {
                // TODO: Make this a generic "shouldInclude" function later to DRY
                if (shouldInclude({ type, includeMega }))
                {
                    acc.push({
                        name,
                        cost,
                        description,
                    });
                }

                return acc;
            }, [] as RandomResult[]);

            // Get random numbers
            const rollResult = new DiceLiteService({
                count: numberOfDice,
                sides: parsedData.length,
            }).roll();
            const rollResults = rollResult.join(', ');

            const uniqueRolls = rollResult.reduce((acc, cur) => {
                const index = acc.findIndex(({ result }) => result === cur);

                if (index >= 0)
                {
                    acc[index].numOfTimesRolled += 1;
                }
                else
                {
                    acc.push({
                        result: cur,
                        numOfTimesRolled: 1,
                    });
                }

                return acc;
            }, [] as {
                result: number;
                numOfTimesRolled: number;
            }[]);

            // Get random items
            const results = uniqueRolls.map(({ result, numOfTimesRolled }) => {
                return {
                    ...parsedData[result - 1],
                    numOfTimesRolled,
                };
            });

            // Get message
            const embed = getRandomResultEmbedMessage({
                itemNamePluralized: subcommandToStrings[PtuRandomSubcommand.HeldItem].plural,
                results,
                rollResults,
            });

            // Send embed
            await interaction.editReply({
                embeds: [embed],
            });

            return true;
        },
        // TODO: DRY this out later so stuff can be shared
        [PtuRandomSubcommand.Metronome]: async (interaction: ChatInputCommandInteraction) =>
        {
            const moves = await getLookupMoveData({
                exclude: {
                    names: [
                        'Struggle',
                        'Hidden Power ',
                        'After You',
                        'Assist',
                        'Bestow',
                        'Copycat',
                        'Counter',
                        'Covet',
                        'Destiny Bond',
                        'Endure',
                        'Feint',
                        'Focus Punch',
                        'Follow Me',
                        'Helping Hand',
                        'Metronome',
                        'Me First',
                        'Mimic',
                        'Mirror Coat',
                        'Mirror Move',
                        'Quash',
                        'Rage Powder',
                        'Sketch',
                        'Sleep Talk',
                        'Snatch',
                        'Snore',
                        'Switcheroo',
                        'Thief',
                        'Transform',
                        'Trick',
                    ],
                    rangeSearch: 'Shield',
                    weaponMovesAndManuevers: true,
                },
            });

            // Get random numbers
            const roll = new DiceLiteService({
                count: 1,
                sides: moves.length,
            }).roll()[0];

            // Get random move
            const move = moves[roll - 1];

            // Get message
            const [embed] = getLookupMovesEmbedMessages([move]);

            // Send embed
            await interaction.editReply({
                embeds: [embed],
            });

            return true;
        },
        // TODO: DRY this out later so stuff can be shared
        [PtuRandomSubcommand.Pokeball]: async (interaction: ChatInputCommandInteraction) =>
        {
            // Get parameter results
            const numberOfDice = interaction.options.getInteger('number_of_dice') as number;
            const includeSpecial = interaction.options.getBoolean('include_special') || false;
            const includeSafari = interaction.options.getBoolean('include_safari') || false;
            const includeJailbreaker = interaction.options.getBoolean('include_jailbreaker') || false;
            const includeCases = interaction.options.getBoolean('include_cases') || false;
            const includeAttachments = interaction.options.getBoolean('include_attachments') || false;
            const includeMaster = interaction.options.getBoolean('include_master') || false;

            const { data = [] } = await CachedGoogleSheetsApiService.getRange({
                // TODO: Make this spreadsheet id a constant later
                spreadsheetId: '12_3yiG7PWWnm0UZm8enUcjLd0f4i3XoZQBpkGCHfKJI',
                range: `'${subcommandToStrings[PtuRandomSubcommand.Pokeball].data} Data'!A2:E`,
            });

            // TODO: Move helper elsewhere in the future
            const shouldInclude = ({ type, includeSpecial, includeSafari, includeJailbreaker, includeCases, includeAttachments, includeMaster }: { type: string, includeSpecial: boolean, includeSafari: boolean, includeJailbreaker: boolean, includeCases: boolean, includeAttachments: boolean, includeMaster: boolean }) =>
            {
                if (type === PokeballType.Normal) return true;
                if (type === PokeballType.Special && includeSpecial) return true;
                if (type === PokeballType.Safari && includeSafari) return true;
                if (type === PokeballType.Jailbreaker && includeJailbreaker) return true;
                if (type === PokeballType.Case && includeCases) return true;
                if (type === PokeballType.Attachment && includeAttachments) return true;
                if (type === PokeballType.Master && includeMaster) return true;
                return false;
            };

            // TODO: Make this parser customizable to DRY out later
            // Parse the data
            const parsedData = data.reduce((acc, [name, cost, mod, type, description]) => {
                // TODO: Make this a generic "shouldInclude" function later to DRY
                if (shouldInclude({ type, includeSpecial, includeSafari, includeJailbreaker, includeCases, includeAttachments, includeMaster }))
                {
                    acc.push({
                        name,
                        cost,
                        description,
                        mod,
                        type,
                    });
                }

                return acc;
            }, [] as RandomPokeball[]);

            const parsedDataOnlyPokeballs = data.reduce((acc, [name, cost, mod, type, description]) => {
                // TODO: Make this a generic "shouldInclude" function later to DRY
                if (shouldInclude({ type, includeSpecial, includeSafari, includeJailbreaker, includeCases: false, includeAttachments: false, includeMaster }))
                {
                    acc.push({
                        name,
                        cost,
                        description,
                        mod,
                        type,
                    });
                }

                return acc;
            }, [] as RandomPokeball[]);

            // Get random numbers
            const rollResult = new DiceLiteService({
                count: numberOfDice,
                sides: parsedData.length,
            }).roll();
            const rollResults = rollResult.join(', '); // TODO: Dynamically generate this, including rerolls later.

            const rerollForPokeballsOnly = (numberOfTimesToRoll: number, jailbreakerInfo: RandomPokeball) =>
            {
                const rollResult = new DiceLiteService({
                    count: numberOfTimesToRoll,
                    sides: parsedDataOnlyPokeballs.length,
                }).roll();

                const uniqueRolls = rollResult.reduce((acc, cur) => {
                    const index = acc.findIndex(({ result }) => result === cur);

                    if (index >= 0)
                    {
                        acc[index].numOfTimesRolled += 1;
                    }
                    else
                    {
                        acc.push({
                            result: cur,
                            numOfTimesRolled: 1,
                        });
                    }

                    return acc;
                }, [] as {
                    result: number;
                    numOfTimesRolled: number;
                }[]);

                return uniqueRolls.map(({ result, numOfTimesRolled }) => {
                    return {
                        ...parsedDataOnlyPokeballs[result - 1],
                        numOfTimesRolled,
                        jailBreakerInfo: jailbreakerInfo,
                    };
                });
            };

            const uniqueRolls = rollResult.reduce((acc, cur) => {
                const index = acc.findIndex(({ result }) => result === cur);

                if (index >= 0)
                {
                    acc[index].numOfTimesRolled += 1;
                }
                else
                {
                    acc.push({
                        result: cur,
                        numOfTimesRolled: 1,
                    });
                }

                return acc;
            }, [] as {
                result: number;
                numOfTimesRolled: number;
            }[]); // TODO: Make unique rolls for rerolls be grouped together with a CompositeKeyRecord for ball name and jailbreak info name later

            // Get random items
            const results = uniqueRolls.reduce((acc, { result, numOfTimesRolled }) => {
                const pokeball = parsedData[result - 1];

                // Reroll for pokeballs to put the case(s) or attachment(s) on
                if (pokeball.type === PokeballType.Case || pokeball.type === PokeballType.Attachment)
                {
                    const newPokeballs = rerollForPokeballsOnly(numOfTimesRolled, pokeball);
                    acc.push(...newPokeballs);
                }

                // Regular pokeballs
                else
                {
                    acc.push({
                        ...parsedData[result - 1],
                        numOfTimesRolled,
                    });
                }

                return acc;
            }, [] as RandomPokeball[]);

            // Get message
            const embed = getRandomPokeballEmbedMessage({
                itemNamePluralized: subcommandToStrings[PtuRandomSubcommand.Pokeball].plural,
                results,
                rollResults,
            });

            // Send embed
            await interaction.editReply({
                embeds: [embed],
            });

            return true;
        },
        [PtuRandomSubcommand.XItem]: async (interaction: ChatInputCommandInteraction) =>
            subcommandHandlerForRandom(interaction, PtuRandomSubcommand.XItem),
        [PtuRandomSubcommand.TM]: async (interaction: ChatInputCommandInteraction) =>
            subcommandHandlerForRandom(interaction, PtuRandomSubcommand.TM),
        [PtuRandomSubcommand.Vitamin]: async (interaction: ChatInputCommandInteraction) =>
            subcommandHandlerForRandom(interaction, PtuRandomSubcommand.Vitamin),
        [PtuRandomSubcommand.Pickup]: async (interaction: ChatInputCommandInteraction) =>
        {
            // Determine what items to roll for
            const [roll] = new DiceLiteService({
                count: 1,
                sides: 20,
            }).roll();

            // Nothing
            if (roll <= 5)
            {
                // Get message
                const embed = getRandomYouFoundNothingEmbedMessage({
                    itemNamePluralized: subcommandToStrings[PtuRandomSubcommand.Pickup].plural,
                    rollResults: roll.toString(),
                });

                // Send embed
                await interaction.editReply({
                    embeds: [embed],
                });
            }

            // X-Item
            else if (roll === 6 || roll === 7)
            {
                return this.subcommandHandlers[PtuSubcommandGroup.Random][PtuRandomSubcommand.XItem](interaction);
            }

            // Berries
            else if (roll >= 8 && roll <= 10)
            {
                return this.subcommandHandlers[PtuSubcommandGroup.Random][PtuRandomSubcommand.Berry](interaction);
            }

            // Pokeball
            else if (roll >= 11 && roll <= 13)
            {
                return this.subcommandHandlers[PtuSubcommandGroup.Random][PtuRandomSubcommand.Pokeball](interaction);
            }

            // Healing
            else if (roll >= 14 && roll <= 16)
            {
                return this.subcommandHandlers[PtuSubcommandGroup.Random][PtuRandomSubcommand.HealingItem](interaction);
            }

            // Evolutionary Stone
            else if (roll === 17)
            {
                return this.subcommandHandlers[PtuSubcommandGroup.Random][PtuRandomSubcommand.EvolutionaryStone](interaction);
            }

            // Vitamin
            else if (roll === 18)
            {
                return this.subcommandHandlers[PtuSubcommandGroup.Random][PtuRandomSubcommand.Vitamin](interaction);
            }

            // Held Item
            else if (roll === 19)
            {
                return this.subcommandHandlers[PtuSubcommandGroup.Random][PtuRandomSubcommand.HeldItem](interaction);
            }

            // TM
            else if (roll === 20)
            {
                return this.subcommandHandlers[PtuSubcommandGroup.Random][PtuRandomSubcommand.TM](interaction);
            }

            return true;
        },
        [PtuRandomSubcommand.DowsingRod]: async (interaction: ChatInputCommandInteraction) =>
        {
            // Get parameter results
            const numberOfDice = interaction.options.getInteger('occult_education_rank') as number;
            const hasCrystalResonance = interaction.options.getBoolean('has_crystal_resonance') || false;
            const hasSkillStuntDowsing = interaction.options.getBoolean('has_skill_stunt_dowsing') || false;
            const isSandyOrRocky = interaction.options.getBoolean('is_sandy_or_rocky') || false;

            const getDiceToRoll = ({ numberOfDice, hasCrystalResonance, hasSkillStuntDowsing, isSandyOrRocky } : { numberOfDice: number, hasCrystalResonance: boolean, hasSkillStuntDowsing: boolean, isSandyOrRocky: boolean }) =>
            {
                let diceToRoll = numberOfDice;

                if (hasCrystalResonance) diceToRoll += 3;
                if (hasSkillStuntDowsing) diceToRoll += 1;
                if (isSandyOrRocky) diceToRoll += 1;

                return diceToRoll;
            };

            // Determine what items to roll for
            const findingShardsRollResult = new DiceLiteService({
                count: getDiceToRoll({ numberOfDice, hasCrystalResonance, hasSkillStuntDowsing, isSandyOrRocky }),
                sides: 6,
                rerollOnGreaterThanOrEqualTo: 6,
            }).roll();

            // Get the number of shards to roll for
            const numOfShardsToRoll = findingShardsRollResult.reduce((acc, roll) => {
                if (roll >= 4)
                {
                    acc += 1;
                }

                return acc;
            }, 0);

            // Nothing
            if (numOfShardsToRoll === 0)
            {
                // Get message
                const embed = getRandomYouFoundNothingEmbedMessage({
                    itemNamePluralized: subcommandToStrings[PtuRandomSubcommand.DowsingRod].plural,
                    rollResults: findingShardsRollResult.join(', '),
                });

                // Send embed
                await interaction.editReply({
                    embeds: [embed],
                });
            }

            // Shard
            else
            {
                // Pull data from spreadsheet
                const { data = [] } = await CachedGoogleSheetsApiService.getRange({
                    // TODO: Make this spreadsheet id a constant later
                    spreadsheetId: '12_3yiG7PWWnm0UZm8enUcjLd0f4i3XoZQBpkGCHfKJI',
                    range: `'${subcommandToStrings[PtuRandomSubcommand.DowsingRod].data} Data'!A2:E`,
                });

                // Parse data
                const parsedData = data.reduce((acc, [name, cost, description]) => {
                    acc.push({
                        name,
                        cost,
                        description,
                    });
                    return acc;
                }, [] as RandomResult[]);

                // Get random numbers
                const shardColorRollResults = new DiceLiteService({
                    count: numOfShardsToRoll,
                    sides: parsedData.length,
                }).roll();

                // Combine numbers to be unique
                const uniqueRolls = shardColorRollResults.reduce((acc, cur) => {
                    const index = acc.findIndex(({ result }) => result === cur);

                    // Increment the number of times rolled
                    if (index >= 0)
                    {
                        acc[index].numOfTimesRolled += 1;
                    }

                    // Add to array for the first time
                    else
                    {
                        acc.push({
                            result: cur,
                            numOfTimesRolled: 1,
                        });
                    }

                    return acc;
                }, [] as {
                    result: number;
                    numOfTimesRolled: number;
                }[]);

                // Get random items based on rolls
                const results = uniqueRolls.map(({ result, numOfTimesRolled }) => {
                    return {
                        ...parsedData[result - 1],
                        numOfTimesRolled,
                    };
                });

                // Get embed message
                const embed = getRandomDowsingRodEmbedMessage({
                    itemNamePluralized: subcommandToStrings[PtuRandomSubcommand.DowsingRod].plural,
                    results,
                    findingShardRollResults: findingShardsRollResult.join(', '),
                    shardColorRollResults: shardColorRollResults.join(', '),
                });

                // Send embed
                await interaction.editReply({
                    embeds: [embed],
                });
            }

            return true;
        },
    }

    private subcommandHandlers: SubcommandHandlers = {
        [PtuSubcommandGroup.Lookup]: this.lookupSubcommandHandlers,
        [PtuSubcommandGroup.Random]: this.randomSubcommandHandlers,
    };

    async run(interaction: ChatInputCommandInteraction)
    {
        // Send message to show the command was received
        await interaction.deferReply({
            fetchReply: true,
        });

        // Get parameter results
        const subcommandGroup = interaction.options.getSubcommandGroup(true) as PtuSubcommandGroup;
        const subcommand = interaction.options.getSubcommand(true);

        // Get handler
        const handler = (subcommandGroup === PtuSubcommandGroup.Lookup)
            ? this.subcommandHandlers[subcommandGroup][subcommand as PtuLookupSubcommand]
            : this.subcommandHandlers[subcommandGroup][subcommand as PtuRandomSubcommand];

        // Run subcommand
        const response = (handler !== undefined)
            ? await handler(interaction)
            : false;

        // Send response if the handler failed or was undefined
        if (!response)
        {
            await interaction.editReply('Subcommand Group or subcommand not yet implemented');
        }
    }

    async autocomplete(interaction: AutocompleteInteraction)
    {
        const focusedValue = interaction.options.getFocused(true);

        let choices: ApplicationCommandOptionChoiceData<string>[] = [];

        // Move Name
        if (focusedValue.name === 'move_name')
        {
            const moves = await getLookupMoveData();
            choices = moves.map<ApplicationCommandOptionChoiceData<string>>(({ name }) => {
                return {
                    name,
                    value: name,
                };
            });
        }

        // Ability Name
        if (focusedValue.name === 'ability_name')
        {
            const abilities = await getLookupAbilityData();
            choices = abilities.map<ApplicationCommandOptionChoiceData<string>>(({ name }) => {
                return {
                    name,
                    value: name,
                };
            });
        }

        // Get the choices matching the search
		const filteredChoices = choices.filter((choice) =>
            choice.name.toLowerCase().startsWith(focusedValue.value.toLowerCase(), 0)
        );

        // Discord limits a maximum of 25 choices to display
        const limitedChoices = filteredChoices.slice(0, MAX_AUTOCOMPLETE_CHOICES);

		await interaction.respond(limitedChoices);
    }

    get description()
    {
        return `Run PTU commands.`;
    }
}

export default new Ptu();
