import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    InteractionEditReplyOptions,
} from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { DiceLiteService } from '../../../../services/DiceLiteService.js';
import { DiscordInteractionCallbackType } from '../../../../types/discord.js';
import { OnRerollCallbackOptions, RerollStrategy } from '../../../strategies/RerollStrategy.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../constants.js';
import { getRandomDowsingRodEmbedMessage } from '../../embed-messages/random.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import { PtuRandomSubcommand } from '../../options/random.js';
import { RandomResult } from '../../types/PtuRandom.js';
import type { PtuChatIteractionStrategy, PtuStrategyMap } from '../../types/strategies.js';
import { BaseRandomStrategy } from './BaseRandomStrategy.js';

interface GetGroupsOfShardsToRollResponse
{
    findingShardsRollResults: number[][];
    groupsOfShardsToRoll: number[];
    totalShardsToRoll: number;
}

@staticImplements<PtuChatIteractionStrategy>()
export class RandomDowsingRodStrategy
{
    public static key: PtuRandomSubcommand.DowsingRod = PtuRandomSubcommand.DowsingRod;

    public static async run(
        interaction: ChatInputCommandInteraction,
        strategies: PtuStrategyMap,
        rerollCallbackOptions: OnRerollCallbackOptions = {
            interactionCallbackType: DiscordInteractionCallbackType.EditReply,
        },
    ): Promise<boolean>
    {
        // Get parameter results
        const numberOfIterations = interaction.options.getInteger('number_of_iterations') || 1;
        const numberOfDice = interaction.options.getInteger('occult_education_rank') as number;
        const hasCrystalResonance = interaction.options.getBoolean('has_crystal_resonance') || false;
        const hasSkillStuntDowsing = interaction.options.getBoolean('has_skill_stunt_dowsing') || false;
        const isSandyOrRocky = interaction.options.getBoolean('is_sandy_or_rocky') || false;

        // Get groups of shards
        const embedInput = this.getGroupsOfShardsToRoll({
            numberOfIterations,
            numberOfDice,
            hasCrystalResonance,
            hasSkillStuntDowsing,
            isSandyOrRocky,
        });

        // Get embed
        const responseOptions = await this.getEmbed(embedInput);

        // Send embed with reroll button
        await RerollStrategy.run({
            interaction,
            options: responseOptions,
            rerollCallbackOptions,
            onRerollCallback: newRerollCallbackOptions => this.run(
                interaction,
                strategies,
                newRerollCallbackOptions,
            ),
            commandName: `/ptu ${PtuSubcommandGroup.Random} ${this.key}`,
        });

        return true;
    }

    private static getGroupsOfShardsToRoll({
        numberOfIterations,
        numberOfDice,
        hasCrystalResonance,
        hasSkillStuntDowsing,
        isSandyOrRocky,
    }: {
        numberOfIterations: number;
        numberOfDice: number;
        hasCrystalResonance: boolean;
        hasSkillStuntDowsing: boolean;
        isSandyOrRocky: boolean;
    }): GetGroupsOfShardsToRollResponse
    {
        const findingShardsRollResults: number[][] = [];
        const groupsOfShardsToRoll: number[] = [];

        for (let index = 0; index < numberOfIterations; index += 1)
        {
            // Determine what items to roll for
            const findingShardsRollResult = new DiceLiteService({
                count: this.getDiceToRoll({
                    numberOfDice,
                    hasCrystalResonance,
                    hasSkillStuntDowsing,
                    isSandyOrRocky,
                }),
                sides: 6,
                rerollOnGreaterThanOrEqualTo: 6,
            }).roll();

            // Get the number of shards to roll for
            const numOfShardsToRoll = findingShardsRollResult.reduce((acc, roll) =>
            {
                if (roll >= 4)
                {
                    return acc + 1;
                }

                return acc;
            }, 0);

            findingShardsRollResults.push(findingShardsRollResult);
            groupsOfShardsToRoll.push(numOfShardsToRoll);
        }

        const totalShardsToRoll = groupsOfShardsToRoll.reduce((acc, cur) => (
            acc + cur
        ), 0);

        return {
            findingShardsRollResults,
            groupsOfShardsToRoll,
            totalShardsToRoll,
        };
    }

    private static getDiceToRoll({
        numberOfDice,
        hasCrystalResonance,
        hasSkillStuntDowsing,
        isSandyOrRocky,
    }: {
        numberOfDice: number;
        hasCrystalResonance: boolean;
        hasSkillStuntDowsing: boolean;
        isSandyOrRocky: boolean;
    }): number
    {
        let diceToRoll = numberOfDice;

        if (hasCrystalResonance) diceToRoll += 3;
        if (hasSkillStuntDowsing) diceToRoll += 1;
        if (isSandyOrRocky) diceToRoll += 1;

        return diceToRoll;
    }

    private static async getEmbed({
        findingShardsRollResults,
        groupsOfShardsToRoll,
        totalShardsToRoll,
    }: GetGroupsOfShardsToRollResponse): Promise<InteractionEditReplyOptions>
    {
        // Set up response object
        let responseOptions: InteractionEditReplyOptions;

        // Nothing
        if (totalShardsToRoll === 0)
        {
            // Get message
            const itemNamePluralized = BaseRandomStrategy.subcommandToStrings[
                PtuRandomSubcommand.DowsingRod
            ].plural;
            const embed = new EmbedBuilder()
                .setTitle(`Random ${itemNamePluralized}`)
                .setDescription(`Result:\n${
                    findingShardsRollResults.reduce((acc, cur, index) =>
                    {
                        const lineBreak = (index === 0) ? '' : '\n';
                        return acc + `${lineBreak}(${cur.join(', ')})`;
                    }, '')
                }\n\nYou found nothing.`)
                .setColor(0xCDCDCD);

            // Set embed
            responseOptions = {
                embeds: [embed],
            };
        }

        // Shard
        else
        {
            // Pull data from spreadsheet
            const { data = [] } = await CachedGoogleSheetsApiService.getRange({
                spreadsheetId: rollOfDarknessPtuSpreadsheetId,
                range: `'${BaseRandomStrategy.subcommandToStrings[
                    PtuRandomSubcommand.DowsingRod
                ].data} Data'!A2:E`,
            });

            // Parse data
            const parsedData = data.reduce<RandomResult[]>((acc, [name, cost, description]) =>
            {
                acc.push({
                    name,
                    cost,
                    description,
                });
                return acc;
            }, []);

            // Get random numbers
            const shardColorRollResults = groupsOfShardsToRoll.map((numOfShardsToRoll) =>
            {
                return new DiceLiteService({
                    count: numOfShardsToRoll,
                    sides: parsedData.length,
                }).roll();
            });

            // Combine numbers to be unique
            const uniqueRolls = shardColorRollResults.reduce<{
                result: number;
                numOfTimesRolled: number;
            }[]>((acc, curArray) =>
            {
                curArray.forEach((cur) =>
                {
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
                });

                return acc;
            }, []);

            // Get random items based on rolls
            const results = uniqueRolls.map(({ result, numOfTimesRolled }) =>
            {
                return {
                    ...parsedData[result - 1],
                    numOfTimesRolled,
                };
            });

            // Get embed message
            const embed = getRandomDowsingRodEmbedMessage({
                itemNamePluralized: BaseRandomStrategy.subcommandToStrings[
                    PtuRandomSubcommand.DowsingRod
                ].plural,
                results,
                findingShardsRollResults,
                shardColorRollResults,
            });

            // Set embed
            responseOptions = {
                embeds: [embed],
            };
        }

        return responseOptions;
    }
}
