/* eslint-disable import/no-cycle */ // TODO: Fix this later.
import { logger } from '@beanc16/logger';
import {
    APIUser,
    ComponentType,
    Message,
    MessageComponentInteraction,
    RESTJSONErrorCodes,
    StringSelectMenuInteraction,
    User,
} from 'discord.js';

import { timeToWaitForCommandInteractions } from '../../../constants/discord.js';
import stillWaitingForModalSingleton from '../../../models/stillWaitingForModalSingleton.js';
import { Tracker } from '../dal/types/Tracker.js';
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

    // eslint-disable-next-line @typescript-eslint/no-use-before-define -- TODO: Fix this later
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
}): void
{
    // Set the user's current action as having not finished yet (this enables listening even after canceling)
    stillWaitingForModalSingleton.upsert(user?.id, true);

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
        .catch((error) =>
        {
            const errorPrefix = 'Collector received no interactions before ending with reason:';
            const messageTimedOut = (error as Error).message.includes(`${errorPrefix} time`);
            const messageWasDeleted = (error as Error).message.includes(`${errorPrefix} messageDelete`)
                || (error as { code: RESTJSONErrorCodes }).code === RESTJSONErrorCodes.UnknownMessage;

            // Ignore timeouts & deletes
            if (!messageTimedOut && !messageWasDeleted)
            {
                logger.error(`An unknown error occurred whilst handling /combat_tracker interactions`, error);
            }
        });
}
