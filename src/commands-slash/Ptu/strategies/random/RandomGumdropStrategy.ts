import {
    APIEmbedField,
    ChatInputCommandInteraction,
    EmbedBuilder,
} from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { DiceLiteService } from '../../../../services/DiceLiteService.js';
import { DiscordInteractionCallbackType } from '../../../../types/discord.js';
import { OnRerollCallbackOptions, RerollStrategy } from '../../../strategies/RerollStrategy.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import { PtuRandomSubcommand } from '../../options/random.js';

enum GumdropFlavor
{
    Salty = 'Salty Gumdrop',
    Spicy = 'Spicy Gumdrop',
    Sour = 'Sour Gumdrop',
    Dry = 'Dry Gumdrop',
    Bitter = 'Bitter Gumdrop',
    Sweet = 'Sweet Gumdrop',
}

interface GetNumOfGumdropsResponse
{
    d8Result: number;
    numOfGumdrops: number;
}

@staticImplements<ChatIteractionStrategy>()
export class RandomGumdropStrategy
{
    public static key: PtuRandomSubcommand.Gumdrop = PtuRandomSubcommand.Gumdrop;
    private static rollToFlavorMap: Record<number, GumdropFlavor> = {
        1: GumdropFlavor.Salty,
        2: GumdropFlavor.Spicy,
        3: GumdropFlavor.Sour,
        4: GumdropFlavor.Dry,
        5: GumdropFlavor.Bitter,
        6: GumdropFlavor.Sweet,
    };

    public static async run(
        interaction: ChatInputCommandInteraction,
        rerollCallbackOptions: OnRerollCallbackOptions = {
            interactionCallbackType: DiscordInteractionCallbackType.EditReply,
        },
    ): Promise<boolean>
    {
        const trainerLevel = interaction.options.getInteger('trainer_level', true);

        // Get gumdrops
        const { d8Result, numOfGumdrops } = this.getNumOfGumdrops(trainerLevel);
        const flavorToNumberOfGumdropsMap = this.getFlavorToNumberOfGumdropsMap(numOfGumdrops);

        // Get embed
        const embed = this.getEmbedMessage(
            flavorToNumberOfGumdropsMap,
            trainerLevel,
            d8Result,
        );

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
            commandName: `/ptu ${PtuSubcommandGroup.Random} ${this.key}`,
        });

        return true;
    }

    private static getNumOfGumdrops(trainerLevel: number): GetNumOfGumdropsResponse
    {
        const [d8Result] = new DiceLiteService({
            count: 1,
            sides: 8,
        }).roll();
        const numOfGumdrops = d8Result + trainerLevel;

        return { d8Result, numOfGumdrops };
    }

    private static getFlavorToNumberOfGumdropsMap(numOfGumdrops: number): Record<GumdropFlavor, number>
    {
        const gumdropFlavorRolls = new DiceLiteService({
            count: numOfGumdrops,
            sides: 6,
        }).roll();

        return gumdropFlavorRolls.reduce<Record<GumdropFlavor, number>>((acc, cur) =>
        {
            const curFlavor = this.rollToFlavorMap[cur];
            acc[curFlavor] += 1;
            return acc;
        }, {
            [GumdropFlavor.Salty]: 0,
            [GumdropFlavor.Spicy]: 0,
            [GumdropFlavor.Sour]: 0,
            [GumdropFlavor.Dry]: 0,
            [GumdropFlavor.Bitter]: 0,
            [GumdropFlavor.Sweet]: 0,
        });
    }

    /* istanbul ignore next */
    private static getEmbedMessage(
        flavorToNumberOfGumdropsMap: Record<GumdropFlavor, number>,
        trainerLevel: number,
        d8Result: number,
    ): EmbedBuilder
    {
        const fields = Object.entries(flavorToNumberOfGumdropsMap).map<APIEmbedField>(([flavor, numOfTimesRolled]) =>
        {
            return {
                name: flavor,
                value: `Amount: ${numOfTimesRolled}`,
            };
        });

        const description = [
            `Result: (${d8Result})`,
            `Trainer Level + Result = (${trainerLevel + d8Result})`,
        ].join('\n');

        const embed = new EmbedBuilder()
            .setTitle(`Gumdrop Bounty`)
            .setDescription(description)
            .setColor(0xCDCDCD)
            .setFields(...fields);

        return embed;
    }
}
