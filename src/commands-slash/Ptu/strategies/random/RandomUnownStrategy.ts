import { Text } from '@beanc16/discordjs-helpers';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { DiceLiteService } from '../../../../services/DiceLiteService.js';
import { DiscordInteractionCallbackType } from '../../../../types/discord.js';
import { getPagedEmbedMessages } from '../../../embed-messages/shared.js';
import { OnRerollCallbackOptions, RerollStrategy } from '../../../strategies/RerollStrategy.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import { PtuRandomSubcommand } from '../../options/random.js';
import { PokemonType } from '../../types/pokemon.js';
import type { PtuChatIteractionStrategy, PtuStrategyMap } from '../../types/strategies.js';
import { RandomHiddenPowerStrategy } from './RandomHiddenPowerStrategy.js';

type UnownSymbol = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z' | '!' | '?';

interface UnownData
{
    isSpecial: boolean;
    symbol?: UnownSymbol;
    level: number;
    isShiny: boolean;
    hiddenPowerType: PokemonType;
}

@staticImplements<PtuChatIteractionStrategy>()
export class RandomUnownStrategy
{
    public static key: PtuRandomSubcommand.Unown = PtuRandomSubcommand.Unown;

    public static async run(
        interaction: ChatInputCommandInteraction,
        strategies: PtuStrategyMap,
        rerollCallbackOptions: OnRerollCallbackOptions = {
            interactionCallbackType: DiscordInteractionCallbackType.EditReply,
        },
    ): Promise<boolean>
    {
        // Get parameter results
        const numberOfUnowns = interaction.options.getInteger('number_of_unowns', true);

        // Get rolls and type
        const results = this.getUnownRolls(numberOfUnowns);

        // Get embed
        const embeds = this.getEmbedMessage(results);

        // Send embed with reroll button
        await RerollStrategy.run({
            interaction,
            options: {
                embeds,
            },
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

    private static getUnownRolls(numberOfUnowns: number): UnownData[]
    {
        const results: UnownData[] = [];

        for (let index = 0; index < numberOfUnowns; index += 1)
        {
            const isSpecial = this.rollIsSpecialUnown();
            const symbol = !isSpecial ? this.rollUnownSymbol() : undefined;
            const level = this.rollUnownLevel();
            const isShiny = this.rollIsShinyUnown();
            const { type: hiddenPowerType } = RandomHiddenPowerStrategy.getRollsAndType();

            results.push({
                isSpecial,
                symbol,
                level,
                isShiny,
                hiddenPowerType,
            });
        }

        return results;
    }

    private static rollIsSpecialUnown(): boolean
    {
        const [roll] = new DiceLiteService({
            count: 1,
            sides: 20,
        }).roll();

        // 1-5 = Special, 6-20 = Not Special
        return roll >= 1 && roll <= 5;
    }

    private static rollUnownSymbol(): UnownSymbol
    {
        const [roll] = new DiceLiteService({
            count: 1,
            sides: 28,
        }).roll();

        const numberToSymbol: Record<number, UnownSymbol> = {
            1: 'A',
            2: 'B',
            3: 'C',
            4: 'D',
            5: 'E',
            6: 'F',
            7: 'G',
            8: 'H',
            9: 'I',
            10: 'J',
            11: 'K',
            12: 'L',
            13: 'M',
            14: 'N',
            15: 'O',
            16: 'P',
            17: 'Q',
            18: 'R',
            19: 'S',
            20: 'T',
            21: 'U',
            22: 'V',
            23: 'W',
            24: 'X',
            25: 'Y',
            26: 'Z',
            27: '!',
            28: '?',
        };

        return numberToSymbol[roll];
    }

    private static rollUnownLevel(): number
    {
        const [roll1, roll2] = new DiceLiteService({
            count: 2,
            sides: 8,
        }).roll();

        return roll1 + roll2;
    }

    private static rollIsShinyUnown(): boolean
    {
        const [roll] = new DiceLiteService({
            count: 1,
            sides: 100,
        }).roll();

        // 1 or 100 = Shiny
        return roll === 1 || roll === 100;
    }

    /* istanbul ignore next */
    private static getEmbedMessage(results: UnownData[]): EmbedBuilder[]
    {
        const embeds = getPagedEmbedMessages({
            input: results,
            title: `Random Unown${results.length > 1 ? 's' : ''}`,
            parseElementToLines: ({
                isSpecial,
                symbol,
                level,
                isShiny,
                hiddenPowerType,
            }, index) => [
                Text.bold(`Unown ${index + 1}`),
                `Special: ${isSpecial ? 'Yes' : 'No'}`,
                ...(symbol !== undefined ? [`Symbol: ${symbol}`] : []),
                `Level: ${level}`,
                `Shiny: ${isShiny ? 'Yes' : 'No'}`,
                `Hidden Power Type: ${hiddenPowerType}`,
                ...(index < results.length - 1 ? [''] : []), // Add a blank line between each entry
            ],
        });

        return embeds;
    }
}
