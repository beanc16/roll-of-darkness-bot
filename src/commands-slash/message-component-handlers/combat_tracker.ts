import { logger } from '@beanc16/logger';
import {
    ComponentType,
    Message,
    MessageComponentInteraction,
    StringSelectMenuInteraction,
} from 'discord.js';

import { timeToWaitForCommandInteractions } from '../../constants/combatTracker.js';
import { Tracker } from '../../dal/RollOfDarknessMongoControllers.js';
import { CombatTrackerStrategyExecutor } from '../strategies/combat_tracker/index.js';

async function handleMessageComponentsForCombatTracker({
    interaction,
    tracker,
} : {
    interaction: MessageComponentInteraction;
    tracker: Tracker;
}): Promise<void>
{
    const {
        componentType,
        customId,
    } = interaction;

    if (componentType === ComponentType.StringSelect)
    {
        const typedInteraction = interaction as StringSelectMenuInteraction;
        const {
            values: [
                value,
            ] = [],
        } = typedInteraction;

        const didRunStrategy = await CombatTrackerStrategyExecutor.run({
            subcommandGroup: customId,
            subcommand: value,
            interaction: typedInteraction,
            tracker,
        });

        if (!didRunStrategy)
        {
            logger.debug(`Attempted to call a string select menu component that doesn't have a handler function.`, {
                subcommandGroup: customId,
                subcommand: value,
            });
        }
    }
}

// TODO: Maybe move this to another file related to strategy pattern things?
export function awaitCombatTrackerMessageComponents({
    message,
    tracker,
} : {
    message: Message;
    tracker: Tracker;
})
{
    // Handle the components of the embed message
    message.awaitMessageComponent({
        filter: (interaction) => (
            interaction.componentType === ComponentType.StringSelect
        ),
        time: timeToWaitForCommandInteractions,
    })
    .then(async (messageComponentInteraction: MessageComponentInteraction) =>
    {
        await handleMessageComponentsForCombatTracker({
            interaction: messageComponentInteraction,
            tracker,
        });
    })
    .catch((error: Error) => 
    {
        // Ignore timeouts
        if (error.message !== 'Collector received no interactions before ending with reason: time')
        {
            logger.error(error);
        }
    });
}
