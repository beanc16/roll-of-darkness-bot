import { logger } from '@beanc16/logger';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import stillWaitingForModalSingleton from '../../../../models/stillWaitingForModalSingleton.js';
import { RollOfDarknessPseudoCache } from '../../dal/RollOfDarknessPseudoCache.js';
import { Tracker } from '../../dal/types/Tracker.js';
import { updateCombatTrackerEmbedMessage } from '../../embed-messages/combat_tracker.js';
import { awaitCombatTrackerMessageComponents } from '../../message-component-handlers/combat_tracker.js';
import { getCombatTrackerActionRows } from '../../select-menus/combat_tracker.js';
import { selectMenuValues } from '../../select-menus/options/combat_tracker.js';
import { CombatTrackerStatus } from '../../types.js';
import { CombatTrackerIteractionStrategy } from '../types/CombatTrackerIteractionStrategy.js';
import { CombatTrackerMessageComponentHandlerParameters } from '../types/CombatTrackerMessageComponentHandlerParameters.js';

@staticImplements<CombatTrackerIteractionStrategy>()
export class MoveTurnStrategy
{
    public static key = selectMenuValues.moveTurn;

    public static async run({ interaction, tracker }: CombatTrackerMessageComponentHandlerParameters): Promise<void>
    {
        // Set command as having started
        stillWaitingForModalSingleton.set(interaction.member?.user.id, false);

        if (tracker.status !== CombatTrackerStatus.InProgress)
        {
            await interaction.reply({
                content: `Cannot update the turn for combat that's not in progress`,
                ephemeral: true,
            });

            // Handle the components of the embed message.
            awaitCombatTrackerMessageComponents({
                message: interaction.message,
                tracker,
                user: interaction.user,
            });

            // Exit function early.
            return;
        }

        if (tracker.characterIds.length === 0)
        {
            await interaction.reply({
                content: 'Cannot update the turn for combat that has no characters',
                ephemeral: true,
            });

            // Handle the components of the embed message.
            awaitCombatTrackerMessageComponents({
                message: interaction.message,
                tracker,
                user: interaction.user,
            });

            // Exit function early.
            return;
        }

        try
        {
            RollOfDarknessPseudoCache.moveTurn({
                tracker,
                turn: 0, // TODO: Move this to a modal later
            })
                .then(async (result: Tracker | boolean) =>
                {
                    if (!result)
                    {
                        await interaction.reply({
                            content: `ERROR: The given turn must be between 1-${tracker.characterIds.length}.`,
                            ephemeral: true,
                        });

                        // Handle the components of the embed message.
                        awaitCombatTrackerMessageComponents({
                            message: interaction.message,
                            tracker,
                            user: interaction.user,
                        });

                        // Exit function early.
                        return;
                    }

                    // We can confidently say that this is a tracker now.
                    const newTracker = result as Tracker;

                    // Get components.
                    const actionRows = getCombatTrackerActionRows({
                        typeOfTracker: newTracker.type,
                        combatTrackerStatus: newTracker.status,
                    });

                    // Get characters.
                    const characters = await RollOfDarknessPseudoCache.getCharacters({
                        tracker: newTracker,
                    });

                    // Update message.
                    await updateCombatTrackerEmbedMessage({
                        tracker: newTracker,
                        characters,
                        interaction,
                        actionRows,
                    });

                    // Handle the components of the embed message.
                    awaitCombatTrackerMessageComponents({
                        message: interaction.message,
                        tracker: newTracker,
                        user: interaction.user,
                    });
                });
        }
        catch (error)
        {
            logger.error('Failed to move the turn of combat', error);
            await interaction.reply({
                content: 'ERROR: Failed to move the turn of combat',
                ephemeral: true,
            });
        }
    }
}
