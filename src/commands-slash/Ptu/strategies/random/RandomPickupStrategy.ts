import { ChatInputCommandInteraction } from 'discord.js';

import { ChatIteractionStrategy } from '../../../strategies/ChatIteractionStrategy.js';
import { staticImplements } from '../../../../decorators/staticImplements.js';
import { PtuRandomSubcommand } from '../../subcommand-groups/random.js';
import { BaseRandomStrategy } from './BaseRandomStrategy.js';
import { DiceLiteService } from '../../../../services/DiceLiteService.js';
import { getRandomYouFoundNothingEmbedMessage } from '../../../Ptu/embed-messages/random.js';
import { RandomXItemStrategy } from './RandomXItemStrategy.js';
import { RandomBerryStrategy } from './RandomBerryStrategy.js';
import { RandomPokeballStrategy } from './RandomPokeballStrategy.js';
import { RandomHealingItemStrategy } from './RandomHealingItemStrategy.js';
import { RandomEvolutionaryStoneStrategy } from './RandomEvolutionaryStoneStrategy.js';
import { RandomVitaminStrategy } from './RandomVitaminStrategy.js';
import { RandomHeldItemStrategy } from './RandomHeldItemStrategy.js';
import { RandomTmStrategy } from './RandomTmStrategy.js';
import { PtuRandomPickupSubcommandResponse } from './types.js';
import { OnRerollCallbackOptions, RerollStrategy } from '../../../strategies/RerollStrategy.js';
import { DiscordInteractionCallbackType } from '../../../../types/discord.js';

@staticImplements<ChatIteractionStrategy>()
export class RandomPickupStrategy
{
    public static key = PtuRandomSubcommand.Pickup;

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
        const subcommandStr = (!!subcommandResponse.commandName)
            ? ` | ${subcommandResponse.commandName}`
            : '';

        await RerollStrategy.run({
            interaction,
            options: subcommandResponse.options,
            interactionCallbackType: rerollCallbackOptions.interactionCallbackType,
            onRerollCallback: (newRerollCallbackOptions) => this.run(
                interaction,
                newRerollCallbackOptions,
            ),
            commandName: `ptu random ${this.key}${subcommandStr}`,
        });

        return true;
    }
}
