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

@staticImplements<ChatIteractionStrategy>()
export class RandomPickupStrategy
{
    public static key = PtuRandomSubcommand.Pickup;

    static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
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
            await interaction.editReply({
                embeds: [embed],
            });
        }

        // X-Item
        else if (roll === 6 || roll === 7)
        {
            return await RandomXItemStrategy.run(interaction);
        }

        // Berries
        else if (roll >= 8 && roll <= 10)
        {
            return await RandomBerryStrategy.run(interaction);
        }

        // Pokeball
        else if (roll >= 11 && roll <= 13)
        {
            return await RandomPokeballStrategy.run(interaction);
        }

        // Healing
        else if (roll >= 14 && roll <= 16)
        {
            return await RandomHealingItemStrategy.run(interaction);
        }

        // Evolutionary Stone
        else if (roll === 17)
        {
            return await RandomEvolutionaryStoneStrategy.run(interaction);
        }

        // Vitamin
        else if (roll === 18)
        {
            return await RandomVitaminStrategy.run(interaction);
        }

        // Held Item
        else if (roll === 19)
        {
            return await RandomHeldItemStrategy.run(interaction);
        }

        // TM
        else if (roll === 20)
        {
            return await RandomTmStrategy.run(interaction);
        }

        return true;
    }
}
