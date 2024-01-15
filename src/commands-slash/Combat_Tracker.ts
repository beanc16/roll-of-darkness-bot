import { BaseSlashCommand } from '@beanc16/discordjs-common-commands';
import { CommandInteraction } from 'discord.js';

import options from './options';
import { Tracker } from '../dal/RollOfDarknessMongoControllers';
import { updateCombatTrackerEmbedMessage } from './embed-messages/combat_tracker';
import { awaitCombatTrackerMessageComponents } from './message-component-handlers/combat_tracker';
import { getCombatTrackerActionRows } from './select-menus/combat_tracker';
import { CombatTrackerType } from '../constants/combatTracker';
import { logger } from '@beanc16/logger';
import { RollOfDarknessPseudoCache } from '../dal/RollOfDarknessPseudoCache';

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
                    combatName: tracker.name,
                    roundNumber: tracker.round,
                    combatStatus: tracker.status,
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

export = new Combat_Tracker();
