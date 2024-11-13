import { BaseSlashCommand } from '@beanc16/discordjs-common-commands';
import { logger } from '@beanc16/logger';
import { CommandInteraction } from 'discord.js';

import { CombatTrackerType } from '../Combat_Tracker/constants.js';
import { Tracker } from '../Combat_Tracker/dal/RollOfDarknessMongoControllers.js';
import { RollOfDarknessPseudoCache } from '../Combat_Tracker/dal/RollOfDarknessPseudoCache.js';
import { updateCombatTrackerEmbedMessage } from '../Combat_Tracker/embed-messages/combat_tracker.js';
import { awaitCombatTrackerMessageComponents } from '../Combat_Tracker/message-component-handlers/combat_tracker.js';
import * as options from '../Combat_Tracker/options.js';
import { getCombatTrackerActionRows } from '../Combat_Tracker/select-menus/combat_tracker.js';

class Combat_Tracker extends BaseSlashCommand
{
    constructor()
    {
        super();
        // eslint-disable-next-line no-underscore-dangle -- TODO: Update this in downstream package later
        this._slashCommandData
            .addStringOption(options.name)
            .addStringOption(options.type);
    }

    async run(interaction: CommandInteraction)
    {
        // Send message to show the command was received
        const message = await interaction.deferReply({
            fetchReply: true,
        });

        // Get parameter results
        const nameKey = interaction.options.get('name')?.value as string;
        const typeKey = interaction.options.get('type')?.value as CombatTrackerType || CombatTrackerType.All;

        // Create tracker
        RollOfDarknessPseudoCache.createTracker({
            trackerName: nameKey,
            trackerType: typeKey,
            interaction,
            message,
        })
            .then(async (tracker: Tracker | undefined) =>
            {
                if (tracker)
                {
                    // Get components
                    const actionRows = getCombatTrackerActionRows({
                        typeOfTracker: typeKey,
                        combatTrackerStatus: tracker.status,
                    });

                    // Handle the components of the embed message
                    awaitCombatTrackerMessageComponents({
                        message,
                        tracker,
                        user: interaction.member?.user,
                    });

                    // Send response
                    await updateCombatTrackerEmbedMessage({
                        tracker,
                        characters: [],
                        interaction,
                        actionRows,
                    });
                }
            })
            .catch(async (error: Error) =>
            {
                logger.warn('Failed to initialize tracker', error);

                // Send response
                await interaction.editReply({
                    content: 'Failed to create tracker',
                });
            });
    }

    get description()
    {
        return `Track characters' HP and/or initiative in combat.`;
    }
}

export default new Combat_Tracker();
