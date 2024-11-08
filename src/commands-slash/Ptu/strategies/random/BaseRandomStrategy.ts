import { ChatInputCommandInteraction } from 'discord.js';
import { PtuRandomSubcommand } from '../../subcommand-groups/random.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService.js';
import { DiceLiteService } from '../../../../services/DiceLiteService.js';
import { getRandomResultEmbedMessage } from '../../../Ptu/embed-messages/random.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../constants.js';
import { OnRerollCallbackOptions, RerollStrategy } from '../../../strategies/RerollStrategy.js';
import { DiscordInteractionCallbackType } from '../../../../types/discord.js';
import { PtuRandomPickupSubcommandResponse } from './types.js';

interface RandomResult
{
    name: string;
    cost?: string;
    description: string;
    numOfTimesRolled?: number;
}

interface BaseRandomStrategyOptions
{
    commandName: string;
    numberOfDice?: number;
    parsedData?: RandomResult[];
}

export class BaseRandomStrategy
{
    public static subcommandToStrings: Record<PtuRandomSubcommand, {
        data: string;
        plural: string;
    }> = {
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
        [PtuRandomSubcommand.Nature]: {
            data: 'Nature',
            plural: 'Natures',
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
    }

    static async run(
        interaction: ChatInputCommandInteraction,
        subcommand: PtuRandomSubcommand,
        options: BaseRandomStrategyOptions,
        rerollCallbackOptions: OnRerollCallbackOptions = {
            interactionCallbackType: DiscordInteractionCallbackType.EditReply,
        },
        shouldReturnMessageOptions = false
    ): Promise<boolean | PtuRandomPickupSubcommandResponse>
    {
        // Get setup data
        const numberOfDice = this.getNumberOfDice(interaction, options) ?? 1;
        const parsedData = await this.getParsedData(subcommand, options);

        // Get random numbers
        const rollResult = new DiceLiteService({
            count: numberOfDice,
            sides: parsedData.length,
        }).roll();
        const rollResults = rollResult.join(', ');

        // Combine numbers to be unique
        const uniqueRolls = rollResult.reduce<{
            result: number;
            numOfTimesRolled: number;
        }[]>((acc, cur) => {
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
        }, []);

        // Get random results based on rolls
        const results = uniqueRolls.map(({ result, numOfTimesRolled }) => {
            return {
                ...parsedData[result - 1],
                numOfTimesRolled,
            };
        });

        // Get embed message
        const embed = getRandomResultEmbedMessage({
            itemNamePluralized: this.subcommandToStrings[subcommand].plural,
            results,
            rollResults,
        });

        if (shouldReturnMessageOptions)
        {
            return {
                options: {
                    embeds: [embed],
                },
                commandName: options.commandName,
            };
        }

        // Send embed with reroll button
        await RerollStrategy.run({
            interaction,
            options: {
                embeds: [embed],
            },
            interactionCallbackType: rerollCallbackOptions.interactionCallbackType,
            onRerollCallback: (newRerollCallbackOptions) => this.run(
                interaction,
                subcommand,
                options,
                newRerollCallbackOptions,
            ),
            commandName: options.commandName,
        });

        return true;
    }

    private static getNumberOfDice(interaction: ChatInputCommandInteraction, options: BaseRandomStrategyOptions)
    {
        if (options.numberOfDice)
        {
            return options.numberOfDice;
        }

        // Get parameter results
        return interaction.options.getInteger('number_of_dice');
    }

    private static async getParsedData(subcommand: PtuRandomSubcommand, options: BaseRandomStrategyOptions)
    {
        if (options.parsedData) {
            return options.parsedData;
        }

        // Pull data from spreadsheet
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessPtuSpreadsheetId,
            range: `'${this.subcommandToStrings[subcommand].data} Data'!A2:D`,
        });

        // Parse data
        return data.reduce<RandomResult[]>((acc, [name, cost, description]) => {
            acc.push({
                name,
                cost,
                description,
            });
            return acc;
        }, []);
    }
}
