import {
    APIEmbedField,
    ChatInputCommandInteraction,
    EmbedBuilder,
} from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { DiceLiteService } from '../../../../services/Dice/DiceLiteService.js';
import { DiceService } from '../../../../services/Dice/DiceService.js';
import rollConstants from '../../../../services/Dice/rollConstants.js';
import { AddAndSubtractMathParser } from '../../../../services/MathParser/AddAndSubtractMathParser.js';
import { DiscordInteractionCallbackType } from '../../../../types/discord.js';
import { OnRerollCallbackOptions, RerollStrategy } from '../../../strategies/RerollStrategy/RerollStrategy.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { NwodSubcommandGroup } from '../../options/index.js';
import { NwodRandomSubcommand } from '../../options/random.js';
import { ChangelingGoblinFruit } from '../../types/ChangelingGoblinFruit.js';
import { ChangelingGoblinFruitRarity } from '../../types/types.js';
import { LookupGoblinFruitStrategy } from '../lookup/LookupGoblinFruitStrategy.js';

interface RandomGoblinFruitParameters
{
    numberOfGoblinFruit: number;
    rolls: number[];
}

interface GetRandomGoblinFruitsParameters
{
    numberOfGoblinFruit: number;
    allGoblinFruitByRarity: Record<ChangelingGoblinFruitRarity, ChangelingGoblinFruit[]>;
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
        const parameterResults = this.getNumOfGoblinFruit(interaction);

        // Handle errors
        if (parameterResults === undefined)
        {
            // TODO: Display error
            return true;
        }

        const { numberOfGoblinFruit, rolls } = parameterResults;

        // Get random goblin fruits
        const allGoblinFruit = await LookupGoblinFruitStrategy.getLookupData();
        const allGoblinFruitByRarity = this.groupGoblinFruitByRarity(allGoblinFruit);
        const randomGoblinFruits = this.getRandomGoblinFruits({
            numberOfGoblinFruit,
            allGoblinFruitByRarity,
        });
        const randomGoblinFruitsByName = this.groupGoblinFruitByName(randomGoblinFruits);

        // Send message
        const embed = this.getEmbedMessages(randomGoblinFruitsByName, rolls);

        // Send embed with reroll button
        await RerollStrategy.run({
            interaction,
            options: {
                embeds: [embed],
            },
            rerollCallbackOptions,
            onRerollCallback: newRerollCallbackOptions => this.run(
                interaction,
                newRerollCallbackOptions,
            ),
            commandName: `/ptu ${NwodSubcommandGroup.Random} ${this.key}`,
        });

        return true;
    }

    private static getNumOfGoblinFruit(interaction: ChatInputCommandInteraction): RandomGoblinFruitParameters | undefined
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

        return {
            numberOfGoblinFruit,
            rolls,
        };
    }

    /* istanbul ignore next */
    private static groupGoblinFruitByRarity(allGoblinFruit: ChangelingGoblinFruit[]): Record<ChangelingGoblinFruitRarity, ChangelingGoblinFruit[]>
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

    /* istanbul ignore next */
    private static groupGoblinFruitByName(goblinFruits: ChangelingGoblinFruit[]): Record<string, ChangelingGoblinFruit[]>
    {
        return goblinFruits.reduce<Record<string, ChangelingGoblinFruit[]>>((acc, cur) =>
        {
            if (!acc[cur.name])
            {
                acc[cur.name] = [];
            }

            acc[cur.name].push(cur);
            return acc;
        }, {});
    }

    private static getRandomGoblinFruits({ numberOfGoblinFruit, allGoblinFruitByRarity }: GetRandomGoblinFruitsParameters): ChangelingGoblinFruit[]
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
            const goblinFruits = allGoblinFruitByRarity[rarity];
            const [goblinFruitRoll] = new DiceLiteService({
                count: 1,
                sides: goblinFruits.length,
            }).roll();
            return goblinFruits[goblinFruitRoll - 1];
        });
    }

    /* istanbul ignore next */
    private static getGoblinFruitRarityTier(rolls: number[]): ChangelingGoblinFruitRarity[]
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

    /* istanbul ignore next */
    private static getEmbedMessages(
        input: Record<string, ChangelingGoblinFruit[]>,
        rolls: number[],
    ): EmbedBuilder
    {
        const goblinFruitsNotFound = Object.keys(input).length === 0;

        const fields = Object.entries(input).map<APIEmbedField>(([name, fruits]) =>
        {
            return {
                name,
                value: `Amount: ${fruits.length}`,
            };
        });

        const embed = new EmbedBuilder()
            .setTitle(`Random Goblin Fruits`)
            .setDescription([
                `Finding Goblin Fruit Result: (${rolls.join(', ')})`,
                ...(goblinFruitsNotFound
                    ? ['\nYou found nothing.']
                    : []
                ),
            ].join('\n'))
            .setColor(0xCDCDCD)
            .setFields(...fields);

        return embed;
    }
}
