import { ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';

import { CombatTrackerOption, combatTrackerOptions } from './options/combat_tracker';
import { CombatTrackerType } from '../../constants/combatTracker';

function parseSelectMenuOptions(typeOfTracker: CombatTrackerType)
{
    // Get the relevant combat trackers based on the type of combat tracker
    const {
        hpCombatTrackers,
        initiativeCombatTrackers,
    } = combatTrackerOptions.reduce((acc, cur) => {
        // The option should be included in the select menu
        const shouldIncludeOption = (
            typeOfTracker === cur.type
            || typeOfTracker === CombatTrackerType.All
        );

        // Add the option to the hp options
        if (shouldIncludeOption && cur.menu === CombatTrackerType.Hp)
        {
            acc.hpCombatTrackers.push(cur);
        }

        // Add the option to the initiative options
        else if (shouldIncludeOption && cur.menu === CombatTrackerType.Initiative)
        {
            acc.initiativeCombatTrackers.push(cur);
        }

        return acc;
    }, {
        hpCombatTrackers: [],
        initiativeCombatTrackers: [],
    } as {
        hpCombatTrackers: CombatTrackerOption[];
        initiativeCombatTrackers: CombatTrackerOption[];
    });

    const sortedHpCombatTrackers = hpCombatTrackers.sort((a, b) => a.rank - b.rank);
    const sortedInitiativeCombatTrackers = initiativeCombatTrackers.sort((a, b) => a.rank - b.rank);

    const hpOptions = sortedHpCombatTrackers.map(({ option }) => option);
    const initiativeOptions = sortedInitiativeCombatTrackers.map(({ option }) => option);

    return {
        hpOptions,
        initiativeOptions,
    };
}

function getCombatTrackerSelectMenus(typeOfTracker: CombatTrackerType)
{
    const {
        hpOptions,
        initiativeOptions,
    } = parseSelectMenuOptions(typeOfTracker);

    const characterOptionSelectMenu = new StringSelectMenuBuilder()
        .setCustomId('character_option_select')
        .addOptions(...hpOptions);

    const initiativeSelectMenu = new StringSelectMenuBuilder()
        .setCustomId('initiative_select')
        .addOptions(...initiativeOptions);

    return {
        characterOptionSelectMenu,
        initiativeSelectMenu,
    };
}

export function getCombatTrackerActionRows(typeOfTracker: CombatTrackerType)
{
    const {
        characterOptionSelectMenu,
        initiativeSelectMenu,
    } = getCombatTrackerSelectMenus(typeOfTracker);

    const characterOptionRow = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(characterOptionSelectMenu);

    const initiativeRow = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(initiativeSelectMenu);

    return [
        characterOptionRow,
        initiativeRow,
    ];
}
