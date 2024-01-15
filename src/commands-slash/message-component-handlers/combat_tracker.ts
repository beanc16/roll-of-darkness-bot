import {
    ComponentType,
    Message,
    MessageComponentInteraction,
    StringSelectMenuInteraction,
} from 'discord.js';
import { CombatTrackerStatus, CombatTrackerType, timeToWaitForCommandInteractions } from '../../constants/combatTracker';
import { Tracker } from '../../dal/RollOfDarknessMongoControllers';
import combatTrackersSingleton from '../../models/combatTrackersSingleton';
import { getCombatTrackerActionRows, selectMenuCustomIds } from '../select-menus/combat_tracker';
import { selectMenuValues } from '../select-menus/options/combat_tracker';
import { logger } from '@beanc16/logger';
import { RollOfDarknessPseudoCache } from '../../dal/RollOfDarknessPseudoCache';
import { updateCombatTrackerEmbedMessage } from '../embed-messages/combat_tracker';
import { AddCharacterModal } from '../../modals/combat-tracker/AddCharacter';

interface CombatTrackerMessageComponentHandlerParameters
{
    interaction: StringSelectMenuInteraction;
    message: Message;
    typeOfTracker: CombatTrackerType;
}

// Character Options
async function editCharacterHp({
    interaction,
    typeOfTracker,
} : CombatTrackerMessageComponentHandlerParameters): Promise<void>
{
    await interaction.reply({
        content: `The ability to edit a character's HP has not yet been implemented`,
        ephemeral: true,
    });

    // Handle the components of the embed message.
    awaitCombatTrackerMessageComponents({
        message: interaction.message,
        typeOfTracker,
    });
}

async function addCharacter({
    interaction,
    typeOfTracker,
} : CombatTrackerMessageComponentHandlerParameters): Promise<void>
{
    // Send the modal.
    await AddCharacterModal.showModal(interaction);

    // Handle the components of the embed message.
    awaitCombatTrackerMessageComponents({
        message: interaction.message,
        typeOfTracker,
    });
}

async function showSecretCharacters({
    interaction,
    typeOfTracker,
} : CombatTrackerMessageComponentHandlerParameters): Promise<void>
{
    await interaction.reply({
        content: 'The ability to show secret characters has not yet been implemented',
        ephemeral: true,
    });

    // Handle the components of the embed message.
    awaitCombatTrackerMessageComponents({
        message: interaction.message,
        typeOfTracker,
    });
}

async function editCharacter({
    interaction,
    typeOfTracker,
} : CombatTrackerMessageComponentHandlerParameters): Promise<void>
{
    await interaction.reply({
        content: 'The ability to edit a character has not yet been implemented',
        ephemeral: true,
    });

    // Handle the components of the embed message.
    awaitCombatTrackerMessageComponents({
        message: interaction.message,
        typeOfTracker,
    });
}

async function removeCharacter({
    interaction,
    typeOfTracker,
} : CombatTrackerMessageComponentHandlerParameters): Promise<void>
{
    await interaction.reply({
        content: 'The ability to remove a character has not yet been implemented',
        ephemeral: true,
    });

    // Handle the components of the embed message.
    awaitCombatTrackerMessageComponents({
        message: interaction.message,
        typeOfTracker,
    });
}

// Initiative Options
async function nextTurn({
    interaction,
    typeOfTracker,
} : CombatTrackerMessageComponentHandlerParameters): Promise<void>
{
    await interaction.reply({
        content: `The ability to go to the next character's turn has not yet been implemented`,
        ephemeral: true,
    });

    // Handle the components of the embed message.
    awaitCombatTrackerMessageComponents({
        message: interaction.message,
        typeOfTracker,
    });
}

async function previousTurn({
    interaction,
    typeOfTracker,
} : CombatTrackerMessageComponentHandlerParameters): Promise<void>
{
    await interaction.reply({
        content: `The ability to go to the previous character's turn has not yet been implemented`,
        ephemeral: true,
    });

    // Handle the components of the embed message.
    awaitCombatTrackerMessageComponents({
        message: interaction.message,
        typeOfTracker,
    });
}

async function moveTurn({
    interaction,
    typeOfTracker,
} : CombatTrackerMessageComponentHandlerParameters): Promise<void>
{
    await interaction.reply({
        content: `The ability to go to a specific character's turn has not yet been implemented`,
        ephemeral: true,
    });

    // Handle the components of the embed message.
    awaitCombatTrackerMessageComponents({
        message: interaction.message,
        typeOfTracker,
    });
}

async function startCombat({
    interaction,
    message,
    typeOfTracker,
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
                // Get components.
                const actionRows = getCombatTrackerActionRows({
                    typeOfTracker,
                    combatTrackerStatus: newTracker.status,
                });

                // Update message.
                await updateCombatTrackerEmbedMessage({
                    combatName: newTracker.name,
                    roundNumber: newTracker.round,
                    combatStatus: newTracker.status,
                    characters: [], // TODO: Update this so characters are sent here later.
                    interaction,
                    actionRows,
                });

                // Handle the components of the embed message.
                awaitCombatTrackerMessageComponents({
                    message: interaction.message,
                    typeOfTracker,
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
    message,
    typeOfTracker,
} : CombatTrackerMessageComponentHandlerParameters): Promise<void>
{
    const tracker = combatTrackersSingleton.get(message.id);

    if (tracker.status === CombatTrackerStatus.InProgress)
    {
        try
        {
            RollOfDarknessPseudoCache.updateTrackerStatus({
                status: CombatTrackerStatus.Completed,
                message,
            })
            .then(async (newTracker: Tracker) =>
            {
                // Get components
                const actionRows = getCombatTrackerActionRows({
                    typeOfTracker,
                    combatTrackerStatus: newTracker.status,
                });

                // Update message.
                await updateCombatTrackerEmbedMessage({
                    combatName: newTracker.name,
                    roundNumber: newTracker.round,
                    combatStatus: newTracker.status,
                    characters: [], // TODO: Update this so characters are sent here later.
                    interaction,
                    actionRows,
                });

                // Handle the components of the embed message.
                awaitCombatTrackerMessageComponents({
                    message: interaction.message,
                    typeOfTracker,
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
            content: 'Cannot end a combat that is not in progress',
            ephemeral: true,
        });
    }
}

const handlerMap: {
    [key1: string]: {
        [key2: string]: (parameters: CombatTrackerMessageComponentHandlerParameters) => Promise<void>;
    };
} = {
    [selectMenuCustomIds.characterOptionSelect]: {
        [selectMenuValues.editHp]: editCharacterHp,
        [selectMenuValues.addCharacter]: addCharacter,
        [selectMenuValues.showSecretCharacters]: showSecretCharacters,
        [selectMenuValues.editCharacter]: editCharacter,
        [selectMenuValues.removeCharacter]: removeCharacter,
    },
    [selectMenuCustomIds.initiativeSelect]: {
        [selectMenuValues.nextTurn]: nextTurn,
        [selectMenuValues.previousTurn]: previousTurn,
        [selectMenuValues.moveTurn]: moveTurn,
        [selectMenuValues.startCombat]: startCombat,
        [selectMenuValues.endCombat]: endCombat,
    },
};

async function handleMessageComponentsForCombatTracker({
    interaction,
    message,
    typeOfTracker,
} : {
    interaction: MessageComponentInteraction;
    message: Message;
    typeOfTracker: CombatTrackerType;
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
                typeOfTracker,
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

export function awaitCombatTrackerMessageComponents({
    message,
    typeOfTracker,
} : {
    message: Message;
    typeOfTracker: CombatTrackerType;
})
{
    // Handle the components of the embed message
    message.awaitMessageComponent({
        filter: (interaction) => (
            interaction.componentType === ComponentType.StringSelect
        ),
        time: timeToWaitForCommandInteractions,
    })
    .then(async (messageComponentInteraction: MessageComponentInteraction) =>
    {
        await handleMessageComponentsForCombatTracker({
            interaction: messageComponentInteraction,
            message,
            typeOfTracker,
        });
    })
    .catch((error: Error) => 
    {
        // Ignore timeouts
        if (error.message !== 'Collector received no interactions before ending with reason: time')
        {
            logger.error(error);
        }
    });
}
