import { BaseSlashCommand } from '@beanc16/discordjs-common-commands';
import { CommandInteraction, ComponentType } from 'discord.js';

import options from './options';
import { Tracker, TrackerController } from '../dal/RollOfDarknessMongoControllers';
import { getCombatTrackerEmbed as getCombatTrackerEmbedMessage } from './embed-messages/combat_tracker';
import { handleMessageComponentsForCombatTracker } from './message-component-handlers/combat_tracker';
import { getCombatTrackerActionRows } from './select-menus/combat_tracker';
import { CombatTrackerType, timeToWaitForCommandInteractions } from '../constants/combatTracker';
import { logger } from '@beanc16/logger';

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
        TrackerController.insertOne({
            name: nameKey,
        })
        .then(async (_: Tracker) =>
        {
            // Get components
            const actionRows = getCombatTrackerActionRows(typeKey);

            // Handle the components of the embed message
            message.awaitMessageComponent({
                filter: (interaction) => (
                    interaction.componentType === ComponentType.StringSelect
                ),
                time: timeToWaitForCommandInteractions,
            })
            .then(handleMessageComponentsForCombatTracker)
            .catch((error: Error) => 
            {
                // Ignore timeouts
                if (error.message !== 'Collector received no interactions before ending with reason: time')
                {
                    logger.error(error);
                }
            });

            // Get embed message
            const embedMessage = getCombatTrackerEmbedMessage({
                roundNumber: 1,
                characters: [],
            });

            // Send response
            await interaction.editReply({
                embeds: [embedMessage],
                components: actionRows,
            });
        })
        .catch(async (error: Error) =>
        {
            logger.error('Failed to initialize tracker', error);

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
