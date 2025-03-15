import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { DiceLiteService } from '../../../../services/DiceLiteService.js';
import { DiscordInteractionCallbackType } from '../../../../types/discord.js';
import { OnRerollCallbackOptions, RerollStrategy } from '../../../strategies/RerollStrategy.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { getRandomYouFoundNothingEmbedMessage } from '../../embed-messages/random.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import { PtuRandomSubcommand } from '../../options/random.js';
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

@staticImplements<ChatIteractionStrategy>()
export class RandomPickupStrategy
{
    public static key: PtuRandomSubcommand.Pickup = PtuRandomSubcommand.Pickup;

    public static async run(
        interaction: ChatInputCommandInteraction,
        rerollCallbackOptions: OnRerollCallbackOptions = {
            interactionCallbackType: DiscordInteractionCallbackType.EditReply,
        },
    ): Promise<boolean>
    {
        let subcommandResponse: {
            options: PtuRandomPickupSubcommandResponse['options'];
            commandName?: string;
        } = {
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
            subcommandResponse = await RandomXItemStrategy.run(interaction, true) as PtuRandomPickupSubcommandResponse;
        }

        // Berries
        else if (roll >= 8 && roll <= 10)
        {
            subcommandResponse = await RandomBerryStrategy.run(interaction, true) as PtuRandomPickupSubcommandResponse;
        }

        // Pokeball
        else if (roll >= 11 && roll <= 13)
        {
            subcommandResponse = await RandomPokeballStrategy.run(interaction, undefined, true) as PtuRandomPickupSubcommandResponse;
        }

        // Healing
        else if (roll >= 14 && roll <= 16)
        {
            subcommandResponse = await RandomHealingItemStrategy.run(interaction, true) as PtuRandomPickupSubcommandResponse;
        }

        // Evolutionary Stone
        else if (roll === 17)
        {
            subcommandResponse = await RandomEvolutionaryStoneStrategy.run(interaction, true) as PtuRandomPickupSubcommandResponse;
        }

        // Vitamin
        else if (roll === 18)
        {
            subcommandResponse = await RandomVitaminStrategy.run(interaction, true) as PtuRandomPickupSubcommandResponse;
        }

        // Held Item
        else if (roll === 19)
        {
            subcommandResponse = await RandomHeldItemStrategy.run(interaction, true) as PtuRandomPickupSubcommandResponse;
        }

        // TM
        else if (roll === 20)
        {
            subcommandResponse = await RandomTmStrategy.run(interaction, true) as PtuRandomPickupSubcommandResponse;
        }

        // Send response with reroll button
        const subcommandStr = (subcommandResponse.commandName)
            ? ` | ${subcommandResponse.commandName}`
            : '';

        await RerollStrategy.run({
            interaction,
            options: subcommandResponse.options,
            rerollCallbackOptions,
            onRerollCallback: newRerollCallbackOptions => this.run(
                interaction,
                newRerollCallbackOptions,
            ),
            commandName: `/ptu ${PtuSubcommandGroup.Random} ${this.key}${subcommandStr}`,
        });

        return true;
    }
}
