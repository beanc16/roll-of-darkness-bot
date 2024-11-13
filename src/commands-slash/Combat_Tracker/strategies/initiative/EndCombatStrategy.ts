import { logger } from '@beanc16/logger';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import stillWaitingForModalSingleton from '../../../../models/stillWaitingForModalSingleton.js';
import { CombatTrackerStatus } from '../../types.js';
import { Tracker } from '../../dal/RollOfDarknessMongoControllers.js';
import { RollOfDarknessPseudoCache } from '../../dal/RollOfDarknessPseudoCache.js';
import { updateCombatTrackerEmbedMessage } from '../../embed-messages/combat_tracker.js';
import { awaitCombatTrackerMessageComponents } from '../../message-component-handlers/combat_tracker.js';
import { getCombatTrackerActionRows } from '../../select-menus/combat_tracker.js';
import { selectMenuValues } from '../../select-menus/options/combat_tracker.js';
import { CombatTrackerIteractionStrategy } from '../types/CombatTrackerIteractionStrategy.js';
import { CombatTrackerMessageComponentHandlerParameters } from '../types/CombatTrackerMessageComponentHandlerParameters.js';

@staticImplements<CombatTrackerIteractionStrategy>()
export class EndCombatStrategy
{
    public static key = selectMenuValues.endCombat;

    static async run({
        interaction,
        tracker,
    }: CombatTrackerMessageComponentHandlerParameters): Promise<void>
    {
        // Set command as having started
        stillWaitingForModalSingleton.set(interaction.member?.user.id, false);

        if (tracker.status === CombatTrackerStatus.InProgress)
        {
            try
            {
                RollOfDarknessPseudoCache.updateTrackerStatus({
                    status: CombatTrackerStatus.Completed,
                    tracker,
                })
                    .then(async (newTracker: Tracker) =>
                    {
                        // Get components
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
                logger.error('Failed to start combat', error);
                await interaction.reply({
                    content: 'ERROR: Failed to start combat',
                    ephemeral: true,
                });
            }
        }
        else
        {
            await interaction.reply({
                content: 'Cannot end a combat that is not in progress',
                ephemeral: true,
            });
        }
    }
}
