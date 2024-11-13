import { ChatInputCommandInteraction, InteractionEditReplyOptions } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService.js';
import { DiceLiteService } from '../../../../services/DiceLiteService.js';
import { DiscordInteractionCallbackType } from '../../../../types/discord.js';
import { RandomResult } from '../../../Ptu.js';
import { OnRerollCallbackOptions, RerollStrategy } from '../../../strategies/RerollStrategy.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../constants.js';
import { getRandomDowsingRodEmbedMessage, getRandomYouFoundNothingEmbedMessage } from '../../embed-messages/random.js';
import { PtuRandomSubcommand } from '../../subcommand-groups/random.js';
import { BaseRandomStrategy } from './BaseRandomStrategy.js';

@staticImplements<ChatIteractionStrategy>()
export class RandomDowsingRodStrategy
{
    public static key = PtuRandomSubcommand.DowsingRod;

    public static async run(
        interaction: ChatInputCommandInteraction,
        rerollCallbackOptions: OnRerollCallbackOptions = {
            interactionCallbackType: DiscordInteractionCallbackType.EditReply,
        },
    ): Promise<boolean>
    {
        // Get parameter results
        const numberOfDice = interaction.options.getInteger('occult_education_rank') as number;
        const hasCrystalResonance = interaction.options.getBoolean('has_crystal_resonance') || false;
        const hasSkillStuntDowsing = interaction.options.getBoolean('has_skill_stunt_dowsing') || false;
        const isSandyOrRocky = interaction.options.getBoolean('is_sandy_or_rocky') || false;

        // Set up response object
        let responseOptions: InteractionEditReplyOptions;

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
                acc += 1;
            }

            return acc;
        }, 0);

        // Nothing
        if (numOfShardsToRoll === 0)
        {
            // Get message
            const embed = getRandomYouFoundNothingEmbedMessage({
                itemNamePluralized: BaseRandomStrategy.subcommandToStrings[
                    PtuRandomSubcommand.DowsingRod
                ].plural,
                rollResults: findingShardsRollResult.join(', '),
            });

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
            const shardColorRollResults = new DiceLiteService({
                count: numOfShardsToRoll,
                sides: parsedData.length,
            }).roll();

            // Combine numbers to be unique
            const uniqueRolls = shardColorRollResults.reduce<{
                result: number;
                numOfTimesRolled: number;
            }[]>((acc, cur) =>
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
                findingShardRollResults: findingShardsRollResult.join(', '),
                shardColorRollResults: shardColorRollResults.join(', '),
            });

            // Set embed
            responseOptions = {
                embeds: [embed],
            };
        }

        // Send embed with reroll button
        await RerollStrategy.run({
            interaction,
            options: responseOptions,
            interactionCallbackType: rerollCallbackOptions.interactionCallbackType,
            onRerollCallback: newRerollCallbackOptions => this.run(
                interaction,
                newRerollCallbackOptions,
            ),
            commandName: `ptu random ${this.key}`,
        });

        return true;
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
}
