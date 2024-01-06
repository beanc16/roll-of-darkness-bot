import { BaseSlashCommand } from '@beanc16/discordjs-common-commands';
import { CommandInteraction, ComponentType } from 'discord.js';

import options from './options';
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
            .addStringOption(options.combatTracker.type);
    }

    async run(interaction: CommandInteraction)
    {
        // Send message to show the command was received
        const message = await interaction.deferReply({
            fetchReply: true,
        });

        // Get parameter results
        const typeKey = interaction.options.get('type')?.value as CombatTrackerType || CombatTrackerType.All;

        // Get components
        const actionRows = getCombatTrackerActionRows(typeKey);

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

        const embedMessage = getCombatTrackerEmbedMessage({
            roundNumber: 1,
            characters: [],
        });

        // Send response
        await interaction.editReply({
            embeds: [embedMessage],
            components: actionRows,
        });
    }

    get description()
    {
        return `Track characters' HP and/or initiative in combat.`;
    }
}

export = new Combat_Tracker();
