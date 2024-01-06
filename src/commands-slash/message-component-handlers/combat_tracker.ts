import {
    ComponentType,
    MessageComponentInteraction,
    StringSelectMenuInteraction,
} from 'discord.js';
import { selectMenuCustomIds } from '../select-menus/combat_tracker';
import { selectMenuValues } from '../select-menus/options/combat_tracker';
import { logger } from '@beanc16/logger';

// Character Options
function addCharacter(interaction: MessageComponentInteraction): void
{
    console.log('Add Character:', interaction);
}

// Initiative Options
function startCombat(interaction: MessageComponentInteraction): void
{
    console.log('Start Combat:', interaction);
}

function endCombat(interaction: MessageComponentInteraction): void
{
    console.log('End Combat:', interaction);
}

const handlerMap: {
    [key1: string]: {
        [key2: string]: (interaction: StringSelectMenuInteraction) => void;
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

export function handleMessageComponentsForCombatTracker(interaction: MessageComponentInteraction): void
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
            handlerMap[customId][value](typedInteraction);
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
