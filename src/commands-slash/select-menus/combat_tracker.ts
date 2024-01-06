import { ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';

import { CombatTrackerOption, combatTrackerOptions } from './options/combat_tracker';
import { CombatTrackerType } from '../../constants/combatTracker';

interface GetCombatTrackerSelectMenusResponse
{
    characterOptionSelectMenu?: StringSelectMenuBuilder;
    initiativeSelectMenu?: StringSelectMenuBuilder;
}

export const selectMenuCustomIds = {
    characterOptionSelect: 'character_option_select',
    initiativeSelect: 'initiative_select',
};

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
            || cur.type === CombatTrackerType.All
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

function getCombatTrackerSelectMenus(typeOfTracker: CombatTrackerType): GetCombatTrackerSelectMenusResponse
{
    const {
        hpOptions,
        initiativeOptions,
    } = parseSelectMenuOptions(typeOfTracker);

    const response: GetCombatTrackerSelectMenusResponse = {};

    if (hpOptions.length > 0)
    {
        const characterOptionSelectMenu = new StringSelectMenuBuilder()
            .setCustomId(selectMenuCustomIds.characterOptionSelect)
            .addOptions(...hpOptions);

        response.characterOptionSelectMenu = characterOptionSelectMenu;
    }

    if (initiativeOptions.length > 0)
    {
        const initiativeSelectMenu = new StringSelectMenuBuilder()
            .setCustomId(selectMenuCustomIds.initiativeSelect)
            .addOptions(...initiativeOptions);

        response.initiativeSelectMenu = initiativeSelectMenu;
    }

    return response;
}

export function getCombatTrackerActionRows(typeOfTracker: CombatTrackerType)
{
    const {
        characterOptionSelectMenu,
        initiativeSelectMenu,
    } = getCombatTrackerSelectMenus(typeOfTracker);

    const rows = [];

    if (characterOptionSelectMenu)
    {
        const characterOptionRow = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(characterOptionSelectMenu);
        rows.push(characterOptionRow);
    }

    if (initiativeSelectMenu)
    {
        const initiativeRow = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(initiativeSelectMenu);
        rows.push(initiativeRow);
    }

    return rows;
}
