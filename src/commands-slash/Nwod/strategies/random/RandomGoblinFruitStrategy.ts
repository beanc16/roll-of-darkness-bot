import { ChatInputCommandInteraction } from 'discord.js';

import rollConstants from '../../../../constants/roll.js';
import { staticImplements } from '../../../../decorators/staticImplements.js';
import { DiceLiteService } from '../../../../services/DiceLiteService.js';
import { DiceService } from '../../../../services/DiceService.js';
import { AddAndSubtractMathParser } from '../../../../services/MathParser/AddAndSubtractMathParser.js';
import { DiscordInteractionCallbackType } from '../../../../types/discord.js';
import { OnRerollCallbackOptions, RerollStrategy } from '../../../strategies/RerollStrategy.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { getLookupGoblinFruitEmbedMessages } from '../../embed-messages/lookup.js';
import { NwodSubcommandGroup } from '../../options/index.js';
import { NwodRandomSubcommand } from '../../options/random.js';
import RollResponseFormatterService from '../../services/RollResponseFormatterService.js';
import { ChangelingGoblinFruit } from '../../types/ChangelingGoblinFruit.js';
import { ChangelingGoblinFruitRarity } from '../../types/types.js';
import { LookupGoblinFruitStrategy } from '../lookup/LookupGoblinFruitStrategy.js';

interface RandomGoblinFruitParameters
{
    numberOfGoblinFruit: number;
    rollResponse: string;
}

interface GetRandomGoblinFruitsParameters
{
    numberOfGoblinFruit: number;
    groupedGoblinFruit: Record<ChangelingGoblinFruitRarity, ChangelingGoblinFruit[]>;
}

@staticImplements<ChatIteractionStrategy>()
export class RandomGoblinFruitStrategy
{
    private static mathParser = new AddAndSubtractMathParser();
    public static key = NwodRandomSubcommand.GoblinFruit;

    /* istanbul ignore next */
    public static async run(
        interaction: ChatInputCommandInteraction,
        rerollCallbackOptions: OnRerollCallbackOptions = {
            interactionCallbackType: DiscordInteractionCallbackType.EditReply,
        },
    ): Promise<boolean>
    {
        // Get parameter results
        const parameterResults = this.getNumOfGoblinFruit(interaction, rerollCallbackOptions);

        // Handle errors
        if (parameterResults === undefined)
        {
            // TODO: Display error
            return true;
        }

        const { numberOfGoblinFruit, rollResponse } = parameterResults;

        // Get random goblin fruits
        const allGoblinFruit = await LookupGoblinFruitStrategy.getLookupData();
        const groupedGoblinFruit = this.groupGoblinFruitByRarity(allGoblinFruit);
        const randomGoblinFruits = this.getRandomGoblinFruits({
            numberOfGoblinFruit,
            groupedGoblinFruit,
        });

        // Send message
        const embeds = getLookupGoblinFruitEmbedMessages(randomGoblinFruits);
        // Send embed with reroll button
        await RerollStrategy.run({
            interaction,
            options: {
                content: rollResponse,
                embeds,
            },
            interactionCallbackType: rerollCallbackOptions.interactionCallbackType,
            onRerollCallback: newRerollCallbackOptions => this.run(
                interaction,
                newRerollCallbackOptions,
            ),
            commandName: `/ptu ${NwodSubcommandGroup.Random} ${this.key}`,
        });

        return true;
    }

    public static getNumOfGoblinFruit(
        interaction: ChatInputCommandInteraction,
        rerollCallbackOptions: OnRerollCallbackOptions,
    ): RandomGoblinFruitParameters | undefined
    {
        // Get parameters
        const dexOrWits = interaction.options.getInteger('dex_or_wits', true);
        const survival = interaction.options.getInteger('survival', true);
        const additionalDiceExpression = interaction.options.getString('additional_dice') ?? '0';
        const rerollsKey = interaction.options.getString('rerolls') as keyof typeof rollConstants.rerollsEnum | null;
        const isRote = interaction.options.getBoolean('rote');

        // Get number of additional dice to roll and parse results to string for math parser.
        const additionalDice = this.mathParser.evaluate(additionalDiceExpression);

        if (additionalDice === undefined)
        {
            // Return undefined for errors
            return undefined;
        }

        // Convert parameters to necessary inputs for service calls
        const numberOfDice = dexOrWits + survival + additionalDice;
        const rerollOnGreaterThanOrEqualTo = (rerollsKey)
            ? rollConstants.rerollsEnum[rerollsKey]?.number
            : undefined;
        const rerollsDisplay = (rerollsKey)
            ? rollConstants.rerollsEnum[rerollsKey]?.display
            : undefined;

        // Roll dice
        const diceService = new DiceService({
            count: numberOfDice,
            rerollOnGreaterThanOrEqualTo,
            isRote,
        });
        const dicePoolGroup = diceService.roll();
        const [rolls] = dicePoolGroup.dicepoolResults;

        // Get number of goblin fruit
        const numberOfGoblinFruit = rolls.reduce((acc, cur) =>
        {
            // 8+ is a success
            if (cur >= 8)
            {
                return acc + 1;
            }

            return acc;
        }, 0);

        // Get roll response
        const rollResponse = new RollResponseFormatterService({
            authorId: rerollCallbackOptions?.newCallingUserId ?? interaction.user.id,
            dicePoolGroup,
            isRote,
            numberOfDice,
            rerollsDisplay,
        }).getResponse()
            .replace('successes', 'goblin fruits')
            .replace('success', 'goblin fruit');

        return {
            numberOfGoblinFruit,
            rollResponse,
        };
    }

    /* istanbul ignore next */
    public static groupGoblinFruitByRarity(allGoblinFruit: ChangelingGoblinFruit[]): Record<ChangelingGoblinFruitRarity, ChangelingGoblinFruit[]>
    {
        return allGoblinFruit.reduce<Record<ChangelingGoblinFruitRarity, ChangelingGoblinFruit[]>>((acc, cur) =>
        {
            const { rarity } = cur;
            acc[rarity].push(cur);

            return acc;
        }, {
            [ChangelingGoblinFruitRarity.VeryLow]: [],
            [ChangelingGoblinFruitRarity.Low]: [],
            [ChangelingGoblinFruitRarity.Medium]: [],
            [ChangelingGoblinFruitRarity.High]: [],
            [ChangelingGoblinFruitRarity.VeryHigh]: [],
        });
    }

    public static getRandomGoblinFruits({ numberOfGoblinFruit, groupedGoblinFruit }: GetRandomGoblinFruitsParameters): ChangelingGoblinFruit[]
    {
        // Calculate the rarities of the goblin fruit to get
        const rarityRolls = new DiceLiteService({
            count: numberOfGoblinFruit,
            sides: 100,
        }).roll();
        const rarities = this.getGoblinFruitRarityTier(rarityRolls);

        // Get random goblin fruits
        return rarities.map((rarity) =>
        {
            const goblinFruits = groupedGoblinFruit[rarity];
            const [goblinFruitRoll] = new DiceLiteService({
                count: 1,
                sides: goblinFruits.length,
            }).roll();
            return goblinFruits[goblinFruitRoll - 1];
        });
    }

    /* istanbul ignore next */
    public static getGoblinFruitRarityTier(rolls: number[]): ChangelingGoblinFruitRarity[]
    {
        return rolls.map(roll =>
        {
            if (roll >= 36 && roll <= 60)
            {
                return ChangelingGoblinFruitRarity.Low;
            }

            if (roll >= 61 && roll <= 80)
            {
                return ChangelingGoblinFruitRarity.Medium;
            }

            if (roll >= 81 && roll <= 95)
            {
                return ChangelingGoblinFruitRarity.High;
            }

            if (roll >= 96 && roll <= 100)
            {
                return ChangelingGoblinFruitRarity.VeryHigh;
            }

            // 1-35 (included last in case dice roller is buggy, it won't give very high always due to a bug)
            return ChangelingGoblinFruitRarity.VeryLow;
        });
    }
}
