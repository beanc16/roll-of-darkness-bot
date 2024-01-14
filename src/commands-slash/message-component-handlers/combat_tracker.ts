import {
    ActionRowBuilder,
    ComponentType,
    Message,
    MessageComponentInteraction,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
} from 'discord.js';
import { CombatTrackerStatus } from '../../constants/combatTracker';
import { Tracker } from '../../dal/RollOfDarknessMongoControllers';
import combatTrackersSingleton from '../../models/combatTrackersSingleton';
import { selectMenuCustomIds } from '../select-menus/combat_tracker';
import { selectMenuValues } from '../select-menus/options/combat_tracker';
import { logger } from '@beanc16/logger';
import { RollOfDarknessPseudoCache } from '../../dal/RollOfDarknessPseudoCache';
import { updateCombatTrackerEmbedMessage } from '../embed-messages/combat_tracker';

interface CombatTrackerMessageComponentHandlerParameters
{
    interaction: StringSelectMenuInteraction;
    message: Message;
    actionRows: ActionRowBuilder<StringSelectMenuBuilder>[];
}

// Character Options
async function addCharacter({
    interaction,
} : CombatTrackerMessageComponentHandlerParameters): Promise<void>
{
    console.log('Add Character:', interaction);
}

// Initiative Options
async function startCombat({
    interaction,
    message,
    actionRows,
} : CombatTrackerMessageComponentHandlerParameters): Promise<void>
{
    const tracker = combatTrackersSingleton.get(message.id);

    // TODO: Only start combat if characters exist.
    if (tracker.status === CombatTrackerStatus.NotStarted)
    {
        try
        {
            RollOfDarknessPseudoCache.updateTrackerStatus({
                status: CombatTrackerStatus.InProgress,
                message,
            })
            .then(async (newTracker: Tracker) =>
            {
                // Update message.
                await updateCombatTrackerEmbedMessage({
                    combatName: newTracker.name,
                    roundNumber: newTracker.round,
                    combatStatus: newTracker.status,
                    characters: [], // TODO: Update this so characters are sent here later.
                    interaction,
                    actionRows,
                });

                // Say that combat was started.
                await interaction.followUp({
                    content: 'Combat was started',
                    ephemeral: true,
                });
            })
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
            content: 'Cannot start a combat that has already been started',
            ephemeral: true,
        });
    }
}

async function endCombat({
    interaction,
} : CombatTrackerMessageComponentHandlerParameters): Promise<void>
{
    console.log('End Combat:', interaction);
}

const handlerMap: {
    [key1: string]: {
        [key2: string]: (parameters: CombatTrackerMessageComponentHandlerParameters) => Promise<void>;
    };
} = {
    [selectMenuCustomIds.characterOptionSelect]: {
        // [selectMenuValues.editHp]: some_function_here,
        [selectMenuValues.addCharacter]: addCharacter,
        // [selectMenuValues.showSecretCharacters]: some_function_here,
        // [selectMenuValues.editCharacter]: some_function_here,
        // [selectMenuValues.removeCharacter]: some_function_here,
    },
    [selectMenuCustomIds.initiativeSelect]: {
        // [selectMenuValues.nextTurn]: some_function_here,
        // [selectMenuValues.previousTurn]: some_function_here,
        // [selectMenuValues.moveTurn]: some_function_here,
        [selectMenuValues.startCombat]: startCombat,
        [selectMenuValues.endCombat]: endCombat,
    },
};

export async function handleMessageComponentsForCombatTracker({
    interaction,
    message,
    actionRows,
} : {
    interaction: MessageComponentInteraction;
    message: Message;
    actionRows: ActionRowBuilder<StringSelectMenuBuilder>[];
}): Promise<void>
{
    const {
        componentType,
        customId,
    } = interaction;

    if (componentType === ComponentType.StringSelect)
    {
        const typedInteraction = interaction as StringSelectMenuInteraction;
        const {
            values: [
                value,
            ] = [],
        } = typedInteraction;

        if (handlerMap[customId][value])
        {
            await handlerMap[customId][value]({
                interaction: typedInteraction,
                message,
                actionRows,
            });
        }
        else
        {
            logger.debug(`Attempted to call a string select menu component that doesn't have a handler function.`, {
                customId,
                value,
                handlerMap,
            });
        }
    }
}
