import { BaseSlashCommand } from '@beanc16/discordjs-common-commands';
import { logger } from '@beanc16/logger';
import { CommandInteraction } from 'discord.js';

import * as options from '../options/index.js';
import { Tracker } from '../../dal/RollOfDarknessMongoControllers.js';
import { updateCombatTrackerEmbedMessage } from '../embed-messages/combat_tracker.js';
import { awaitCombatTrackerMessageComponents } from '../message-component-handlers/combat_tracker.js';
import { getCombatTrackerActionRows } from '../select-menus/combat_tracker.js';
import { CombatTrackerType } from '../../constants/combatTracker.js';
import { RollOfDarknessPseudoCache } from '../../dal/RollOfDarknessPseudoCache.js';

class Combat_Tracker extends BaseSlashCommand
{
    constructor()
    {
        super();
        this._slashCommandData
            .addStringOption(options.combatTracker.name)
            .addStringOption(options.combatTracker.type);
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
