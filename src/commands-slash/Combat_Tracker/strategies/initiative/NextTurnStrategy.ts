import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CombatTrackerIteractionStrategy } from '../types/CombatTrackerIteractionStrategy.js';
import { CombatTrackerMessageComponentHandlerParameters } from '../types/CombatTrackerMessageComponentHandlerParameters.js';
import { selectMenuValues } from '../../../select-menus/options/combat_tracker.js';
import { awaitCombatTrackerMessageComponents } from '../../message-component-handlers/combat_tracker.js';
import { CombatTrackerStatus } from '../../constants.js';
import { RollOfDarknessPseudoCache } from '../../dal/RollOfDarknessPseudoCache.js';
import { Tracker } from '../../dal/RollOfDarknessMongoControllers.js';
import { getCombatTrackerActionRows } from '../../../select-menus/combat_tracker.js';
import { updateCombatTrackerEmbedMessage } from '../../embed-messages/combat_tracker.js';
import { logger } from '@beanc16/logger';
import stillWaitingForModalSingleton from '../../../../models/stillWaitingForModalSingleton.js';

@staticImplements<CombatTrackerIteractionStrategy>()
export class NextTurnStrategy
{
    public static key = selectMenuValues.nextTurn;

    static async run({
        interaction,
        tracker,
    }: CombatTrackerMessageComponentHandlerParameters): Promise<void>
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
        else if (tracker.characterIds.length === 0)
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
            RollOfDarknessPseudoCache.nextTurn({
                tracker,
            })
            .then(async (newTracker: Tracker) =>
            {
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
            })
        }
        catch (error)
        {
            logger.error('Failed to go to the next turn of combat', error);
            await interaction.reply({
                content: 'ERROR: Failed to go to the next turn of combat',
                ephemeral: true,
            });
        }
    }
}
