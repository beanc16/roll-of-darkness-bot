import { BaseSlashCommand } from '@beanc16/discordjs-common-commands';
import { ChatInputCommandInteraction } from 'discord.js';

import * as options from './options';
import { CachedGoogleSheetsApiService } from '../services/CachedGoogleSheetsApiService';
import { PtuSubcommandGroup } from './options/subcommand-groups';
import { BerryTier, PtuRandomSubcommand } from './options/subcommand-groups/ptu/random';
import { DiceLiteService } from '../services/DiceLiteService';
import { getRandomResultEmbedMessage } from './embed-messages/ptu/random';

enum HeldItemTypes
{
    Normal = 'Normal',
    Mega = 'Mega',
}

type SubcommandHandlers = Record<
    PtuSubcommandGroup,
    Record<
        PtuRandomSubcommand,
        (interaction: ChatInputCommandInteraction) => Promise<boolean>
    >
>;

export interface RandomResult
{
    name: string;
    cost: string;
    description: string;
    numOfTimesRolled?: number;
}

export interface RandomBerry extends RandomResult
{
    tier: number;
}

interface StringsForSubcommand {
    data: string;
    plural: string;
}

type SubcommandToStrings = {
    [key in PtuRandomSubcommand]: StringsForSubcommand;
};

const subcommandToStrings: SubcommandToStrings = {
    [PtuRandomSubcommand.Berry]: {
        data: 'Berry',
        plural: 'Berries',
    },
    [PtuRandomSubcommand.EvolutionaryStone]: {
        data: 'Evolutionary Stone',
        plural: 'Evolutionary Stones',
    },
    [PtuRandomSubcommand.HeldItem]: {
        data: 'Held Item',
        plural: 'Held Items',
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

const subcommandHandler = async (interaction: ChatInputCommandInteraction, subcommand: PtuRandomSubcommand) => {
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
        if (index > 0)
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

class Ptu extends BaseSlashCommand
{
    constructor()
    {
        super();
        this._slashCommandData
            .addSubcommandGroup(options.subcommandGroups.random);
    }

    private subcommandHandlers: SubcommandHandlers = {
        [PtuSubcommandGroup.Random]: {
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

                    if (index > 0)
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
                subcommandHandler(interaction, PtuRandomSubcommand.EvolutionaryStone),
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

                    if (index > 0)
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
            [PtuRandomSubcommand.XItem]: async (interaction: ChatInputCommandInteraction) =>
                subcommandHandler(interaction, PtuRandomSubcommand.XItem),
            [PtuRandomSubcommand.TM]: async (interaction: ChatInputCommandInteraction) =>
                subcommandHandler(interaction, PtuRandomSubcommand.TM),
            [PtuRandomSubcommand.Vitamin]: async (interaction: ChatInputCommandInteraction) =>
                subcommandHandler(interaction, PtuRandomSubcommand.Vitamin),
        },
    };

    async run(interaction: ChatInputCommandInteraction)
    {
        // Send message to show the command was received
        await interaction.deferReply({
            fetchReply: true,
        });

        // Get parameter results
        const subcommandGroup = interaction.options.getSubcommandGroup() as PtuSubcommandGroup;
        const subcommand = interaction.options.getSubcommand() as PtuRandomSubcommand;

        // Get handler
        const handler = this.subcommandHandlers[subcommandGroup][subcommand];

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

    get description()
    {
        return `Run PTU commands.`;
    }
}

export default new Ptu();
