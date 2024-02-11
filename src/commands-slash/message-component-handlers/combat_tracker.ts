import {
    ComponentType,
    Message,
    MessageComponentInteraction,
    StringSelectMenuInteraction,
} from 'discord.js';
import { CombatTrackerStatus, timeToWaitForCommandInteractions } from '../../constants/combatTracker';
import { Tracker } from '../../dal/RollOfDarknessMongoControllers';
import { getCombatTrackerActionRows, selectMenuCustomIds } from '../select-menus/combat_tracker';
import { selectMenuValues } from '../select-menus/options/combat_tracker';
import { logger } from '@beanc16/logger';
import { RollOfDarknessPseudoCache } from '../../dal/RollOfDarknessPseudoCache';
import { updateCombatTrackerEmbedMessage } from '../embed-messages/combat_tracker';
import { AddCharacterModal } from '../../modals/combat-tracker/AddCharacter';
import { EditCharacterHpModal } from '../../modals/combat-tracker/EditCharacterHp';
import { RemoveCharacterModal } from '../../modals/combat-tracker/RemoveCharacter';

interface CombatTrackerMessageComponentHandlerParameters
{
    interaction: StringSelectMenuInteraction;
    tracker: Tracker;
}

// Character Options
async function editCharacterHp({
    interaction,
    tracker,
} : CombatTrackerMessageComponentHandlerParameters): Promise<void>
{
    // Send the modal.
    await EditCharacterHpModal.showModal(interaction, tracker);
}

async function addCharacter({
    interaction,
    tracker,
} : CombatTrackerMessageComponentHandlerParameters): Promise<void>
{
    // Send the modal.
    await AddCharacterModal.showModal(interaction, tracker.type);
}

async function showSecretCharacters({
    interaction,
    tracker,
} : CombatTrackerMessageComponentHandlerParameters): Promise<void>
{
    await interaction.reply({
        content: 'The ability to show secret characters has not yet been implemented',
        ephemeral: true,
    });

    // Handle the components of the embed message.
    awaitCombatTrackerMessageComponents({
        message: interaction.message,
        tracker,
    });
}

async function editCharacter({
    interaction,
    tracker,
} : CombatTrackerMessageComponentHandlerParameters): Promise<void>
{
    await interaction.reply({
        content: 'The ability to edit a character has not yet been implemented',
        ephemeral: true,
    });

    // Handle the components of the embed message.
    awaitCombatTrackerMessageComponents({
        message: interaction.message,
        tracker,
    });
}

async function removeCharacter({
    interaction,
    tracker,
} : CombatTrackerMessageComponentHandlerParameters): Promise<void>
{
    // Send the modal.
    await RemoveCharacterModal.showModal(interaction, tracker);
}

// Initiative Options
async function nextTurn({
    interaction,
    tracker,
} : CombatTrackerMessageComponentHandlerParameters): Promise<void>
{
    await interaction.reply({
        content: `The ability to go to the next character's turn has not yet been implemented`,
        ephemeral: true,
    });

    // Handle the components of the embed message.
    awaitCombatTrackerMessageComponents({
        message: interaction.message,
        tracker,
    });
}

async function previousTurn({
    interaction,
    tracker,
} : CombatTrackerMessageComponentHandlerParameters): Promise<void>
{
    await interaction.reply({
        content: `The ability to go to the previous character's turn has not yet been implemented`,
        ephemeral: true,
    });

    // Handle the components of the embed message.
    awaitCombatTrackerMessageComponents({
        message: interaction.message,
        tracker,
    });
}

async function moveTurn({
    interaction,
    tracker,
} : CombatTrackerMessageComponentHandlerParameters): Promise<void>
{
    await interaction.reply({
        content: `The ability to go to a specific character's turn has not yet been implemented`,
        ephemeral: true,
    });

    // Handle the components of the embed message.
    awaitCombatTrackerMessageComponents({
        message: interaction.message,
        tracker,
    });
}

async function startCombat({
    interaction,
    tracker,
} : CombatTrackerMessageComponentHandlerParameters): Promise<void>
{
    if (tracker.status !== CombatTrackerStatus.NotStarted)
    {
        await interaction.reply({
            content: 'Cannot start a combat that has already been started',
            ephemeral: true,
        });

        // Handle the components of the embed message.
        awaitCombatTrackerMessageComponents({
            message: interaction.message,
            tracker,
        });

        // Exit function early.
        return;
    }
    else if (tracker.characterIds.length === 0)
    {
        await interaction.reply({
            content: 'Cannot start a combat that has no characters',
            ephemeral: true,
        });

        // Handle the components of the embed message.
        awaitCombatTrackerMessageComponents({
            message: interaction.message,
            tracker,
        });

        // Exit function early.
        return;
    }

    try
    {
        RollOfDarknessPseudoCache.updateTrackerStatus({
            status: CombatTrackerStatus.InProgress,
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

async function endCombat({
    interaction,
    tracker,
} : CombatTrackerMessageComponentHandlerParameters): Promise<void>
{
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
    tracker,
} : {
    interaction: MessageComponentInteraction;
    tracker: Tracker;
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
                tracker,
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
    tracker,
} : {
    message: Message;
    tracker: Tracker;
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
            tracker,
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
