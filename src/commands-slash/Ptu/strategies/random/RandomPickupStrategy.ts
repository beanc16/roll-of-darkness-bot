import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { DiceLiteService } from '../../../../services/Dice/DiceLiteService.js';
import { DiscordInteractionCallbackType } from '../../../../types/discord.js';
import { OnRerollCallbackOptions, RerollStrategy } from '../../../strategies/RerollStrategy/RerollStrategy.js';
import { getRandomYouFoundNothingEmbedMessage } from '../../embed-messages/random.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import { PtuRandomSubcommand } from '../../options/random.js';
import type { PtuChatIteractionStrategy, PtuStrategyMap } from '../../types/strategies.js';
import { BaseRandomStrategy } from './BaseRandomStrategy.js';
import { RandomBerryStrategy } from './RandomBerryStrategy.js';
import { RandomEvolutionaryStoneStrategy } from './RandomEvolutionaryStoneStrategy.js';
import { RandomHealingItemStrategy } from './RandomHealingItemStrategy.js';
import { RandomHeldItemStrategy } from './RandomHeldItemStrategy.js';
import { RandomPokeballStrategy } from './RandomPokeballStrategy.js';
import { RandomTmStrategy } from './RandomTmStrategy.js';
import { RandomVitaminStrategy } from './RandomVitaminStrategy.js';
import { RandomXItemStrategy } from './RandomXItemStrategy.js';
import { PtuRandomPickupSubcommandResponse } from './types.js';

interface RandomPickupGetParameterResults
{
    numberOfDice: number;
}

interface PickupSubcommandResponse
{
    options: PtuRandomPickupSubcommandResponse['options'];
    commandName?: string;
}

@staticImplements<PtuChatIteractionStrategy>()
export class RandomPickupStrategy
{
    public static key: PtuRandomSubcommand.Pickup = PtuRandomSubcommand.Pickup;

    public static async run(
        interaction: ChatInputCommandInteraction,
        strategies: PtuStrategyMap,
        rerollCallbackOptions: OnRerollCallbackOptions = {
            interactionCallbackType: DiscordInteractionCallbackType.EditReply,
        },
    ): Promise<boolean>
    {
        const { numberOfDice } = this.getOptions(interaction);

        const cumulativeResponse: {
            subcommandResponse: PickupSubcommandResponse;
            subcommandStrs: string[];
        } = {
            subcommandResponse: {
                options: {
                    embeds: [],
                },
            },
            subcommandStrs: [],
        };

        // Roll the dice the given number of times and collect the results
        for (let index = 0; index < numberOfDice; index += 1)
        {
            const result = await this.rollPickup(
                interaction,
                strategies,
            );

            cumulativeResponse.subcommandResponse.options.embeds.push(
                ...result.subcommandResponse.options.embeds,
            );
            cumulativeResponse.subcommandStrs.push(result.subcommandStr);
        }

        await RerollStrategy.run({
            interaction,
            options: cumulativeResponse.subcommandResponse.options,
            rerollCallbackOptions,
            onRerollCallback: newRerollCallbackOptions => this.run(
                interaction,
                strategies,
                newRerollCallbackOptions,
            ),
            commandName: `/ptu ${PtuSubcommandGroup.Random} ${this.key} | ${cumulativeResponse.subcommandStrs.join(' | ')}`,
        });

        return true;
    }

    private static async rollPickup(
        interaction: ChatInputCommandInteraction,
        strategies: PtuStrategyMap,
    ): Promise<{
        subcommandResponse: PickupSubcommandResponse;
        subcommandStr: string;
    }>
    {
        let subcommandResponse: PickupSubcommandResponse = {
            options: {
                embeds: [],
            },
        };

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
                itemNamePluralized: BaseRandomStrategy.subcommandToStrings[
                    PtuRandomSubcommand.Pickup
                ].plural,
                rollResults: roll.toString(),
            });

            // Send embed
            subcommandResponse = {
                options: {
                    embeds: [embed],
                },
            };
        }

        // X-Item
        else if (roll === 6 || roll === 7)
        {
            subcommandResponse = await RandomXItemStrategy.run(interaction, strategies, true) as PtuRandomPickupSubcommandResponse;
        }

        // Berries
        else if (roll >= 8 && roll <= 10)
        {
            subcommandResponse = await RandomBerryStrategy.run(interaction, strategies, true) as PtuRandomPickupSubcommandResponse;
        }

        // Pokeball
        else if (roll >= 11 && roll <= 13)
        {
            subcommandResponse = await RandomPokeballStrategy.run(interaction, strategies, { shouldReturnMessageOptions: true }) as PtuRandomPickupSubcommandResponse;
        }

        // Healing
        else if (roll >= 14 && roll <= 16)
        {
            subcommandResponse = await RandomHealingItemStrategy.run(interaction, strategies, true) as PtuRandomPickupSubcommandResponse;
        }

        // Evolutionary Stone
        else if (roll === 17)
        {
            subcommandResponse = await RandomEvolutionaryStoneStrategy.run(interaction, strategies, true) as PtuRandomPickupSubcommandResponse;
        }

        // Vitamin
        else if (roll === 18)
        {
            subcommandResponse = await RandomVitaminStrategy.run(interaction, strategies, true) as PtuRandomPickupSubcommandResponse;
        }

        // Held Item
        else if (roll === 19)
        {
            subcommandResponse = await RandomHeldItemStrategy.run(interaction, strategies, true) as PtuRandomPickupSubcommandResponse;
        }

        // TM
        else if (roll === 20)
        {
            subcommandResponse = await RandomTmStrategy.run(interaction, strategies, true) as PtuRandomPickupSubcommandResponse;
        }

        // Set subcommand name
        const subcommandStr = subcommandResponse.commandName || '';

        return { subcommandResponse, subcommandStr };
    }

    private static getOptions(interaction: ChatInputCommandInteraction): RandomPickupGetParameterResults
    {
        const numberOfDice = interaction.options.getInteger('number_of_pickups') ?? 1;

        return { numberOfDice };
    }
}
