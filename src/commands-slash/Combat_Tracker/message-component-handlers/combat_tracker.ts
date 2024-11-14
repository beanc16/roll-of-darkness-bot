import { logger } from '@beanc16/logger';
import {
    APIUser,
    ComponentType,
    Message,
    MessageComponentInteraction,
    StringSelectMenuInteraction,
    User,
} from 'discord.js';

import { timeToWaitForCommandInteractions } from '../../../constants/discord.js';
import stillWaitingForModalSingleton from '../../../models/stillWaitingForModalSingleton.js';
import { Tracker } from '../dal/AggregatedTrackerWithCharactersController.js';
import { CombatTrackerStrategyExecutor } from '../strategies/index.js';

async function handleMessageComponentsForCombatTracker({
    interaction,
    tracker,
    user,
}: {
    interaction: MessageComponentInteraction;
    tracker: Tracker;
    user?: User | APIUser | undefined;
}): Promise<void>
{
    const { componentType, customId } = interaction;

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

    awaitCombatTrackerMessageComponents({
        message: interaction.message,
        tracker,
        user,
    });
}

// TODO: Maybe move this to another file related to strategy pattern things?
export function awaitCombatTrackerMessageComponents({
    message,
    tracker,
    user,
}: {
    message: Message;
    tracker: Tracker;
    user: User | APIUser | undefined;
})
{
    // Set the user's current action as having not finished yet (this enables listening even after canceling)
    stillWaitingForModalSingleton.set(user?.id, true);

    // Handle the components of the embed message
    message.awaitMessageComponent({
        componentType: ComponentType.StringSelect,
        filter: interaction => (
            stillWaitingForModalSingleton.get(interaction.user.id)
        ),
        time: timeToWaitForCommandInteractions,
    })
        .then(async (messageComponentInteraction: MessageComponentInteraction) =>
        {
            await handleMessageComponentsForCombatTracker({
                interaction: messageComponentInteraction,
                tracker,
                user: messageComponentInteraction.member?.user,
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
