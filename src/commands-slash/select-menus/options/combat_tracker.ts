import { StringSelectMenuOptionBuilder } from 'discord.js';

import { CombatTrackerStatus, CombatTrackerType } from '../../Combat_Tracker/constants.js';

export const selectMenuValues = {
    // HP Options
    editHp: 'edit_hp_button',
    addCharacter: 'add_character_button',
    showSecretCharacters: 'show_secret_characters_button',
    editCharacter: 'edit_character_button',
    removeCharacter: 'remove_character_button',
    // Initiative Options
    nextTurn: 'next_turn_button',
    previousTurn: 'previous_turn_button',
    moveTurn: 'move_turn_button',
    startCombat: 'start_combat_button',
    endCombat: 'end_combat_button',
};

// HP Options
const editCharacterHpOption = new StringSelectMenuOptionBuilder()
    .setLabel('Edit Character HP')
    .setDescription(`Edit a character's HP value`)
    .setValue(selectMenuValues.editHp)
    .setEmoji({ name: '❤' })
    .setDefault(false);

const addCharacterOption = new StringSelectMenuOptionBuilder()
    .setLabel('Add Character')
    .setDescription(`Add a character to combat`)
    .setValue(selectMenuValues.addCharacter)
    .setEmoji({ name: '🏃' })
    .setDefault(false);

// const showSecretCharactersOption = new StringSelectMenuOptionBuilder()
//     .setLabel('Show Secret Characters')
//     .setDescription(`Send the initiative order with secret information visible (that only you can see)`)
//     .setValue(selectMenuValues.showSecretCharacters)
//     .setEmoji({ name: '👀' })
//     .setDefault(false);

// const editCharacterOption = new StringSelectMenuOptionBuilder()
//     .setLabel('Edit Character')
//     .setDescription(`Edit a character's name or initiative value`)
//     .setValue(selectMenuValues.editCharacter)
//     .setEmoji({ name: '📝' })
//     .setDefault(false);

const removeCharacterOption = new StringSelectMenuOptionBuilder()
    .setLabel('Remove Character')
    .setDescription(`Remove a character from combat`)
    .setValue(selectMenuValues.removeCharacter)
    .setEmoji({ name: '❌' })
    .setDefault(false);

// Initiative Options
const nextTurnOption = new StringSelectMenuOptionBuilder()
    .setLabel('Next Turn')
    .setDescription(`Go to the next turn in the initiative order`)
    .setValue(selectMenuValues.nextTurn)
    .setEmoji({ name: '⏭' })
    .setDefault(false);

const previousTurnOption = new StringSelectMenuOptionBuilder()
    .setLabel('Previous Turn')
    .setDescription(`Go to the previous turn in the initiative order`)
    .setValue(selectMenuValues.previousTurn)
    .setEmoji({ name: '⏮' })
    .setDefault(false);

const moveTurnOption = new StringSelectMenuOptionBuilder()
    .setLabel('Move Turn')
    .setDescription(`Move to a specific turn in the initiative order`)
    .setValue(selectMenuValues.moveTurn)
    .setEmoji({ name: '↪' })
    .setDefault(false);

const startCombatOption = new StringSelectMenuOptionBuilder()
    .setLabel('Start Combat')
    .setDescription(`Start tracking turns in the initiative order`)
    .setValue(selectMenuValues.startCombat)
    .setEmoji({ name: '▶' })
    .setDefault(false);

const endCombatOption = new StringSelectMenuOptionBuilder()
    .setLabel('End Combat')
    .setDescription(`Stop tracking turns in the initiative order`)
    .setValue(selectMenuValues.endCombat)
    .setEmoji({ name: '🏁' })
    .setDefault(false);

export interface CombatTrackerOption
{
    option: StringSelectMenuOptionBuilder;
    menu: CombatTrackerType;
    type: CombatTrackerType;
    status: CombatTrackerStatus;
    rank: number;
}

export const combatTrackerOptions: CombatTrackerOption[] = [
    {
        option: editCharacterHpOption,
        menu: CombatTrackerType.Hp,
        type: CombatTrackerType.Hp,
        status: CombatTrackerStatus.NotStartedOrInProgress,
        rank: 0,
    },
    {
        option: addCharacterOption,
        menu: CombatTrackerType.Hp,
        type: CombatTrackerType.All,
        status: CombatTrackerStatus.NotStartedOrInProgress,
        rank: 1,
    },
    // {
    //     option: showSecretCharactersOption,
    //     menu: CombatTrackerType.Hp,
    //     type: CombatTrackerType.All,
    //     status: CombatTrackerStatus.All,
    //     rank: 2,
    // },
    // {
    //     option: editCharacterOption,
    //     menu: CombatTrackerType.Hp,
    //     type: CombatTrackerType.All,
    //     status: CombatTrackerStatus.NotStartedOrInProgress,
    //     rank: 3,
    // },
    {
        option: removeCharacterOption,
        menu: CombatTrackerType.Hp,
        type: CombatTrackerType.All,
        status: CombatTrackerStatus.NotStartedOrInProgress,
        rank: 4,
    },
    {
        option: nextTurnOption,
        menu: CombatTrackerType.Initiative,
        type: CombatTrackerType.Initiative,
        status: CombatTrackerStatus.InProgress,
        rank: 0,
    },
    {
        option: previousTurnOption,
        menu: CombatTrackerType.Initiative,
        type: CombatTrackerType.Initiative,
        status: CombatTrackerStatus.InProgress,
        rank: 1,
    },
    {
        option: moveTurnOption,
        menu: CombatTrackerType.Initiative,
        type: CombatTrackerType.Initiative,
        status: CombatTrackerStatus.InProgress,
        rank: 2,
    },
    {
        option: startCombatOption,
        menu: CombatTrackerType.Initiative,
        type: CombatTrackerType.All,
        status: CombatTrackerStatus.NotStarted,
        rank: 3,
    },
    {
        option: endCombatOption,
        menu: CombatTrackerType.Initiative,
        type: CombatTrackerType.All,
        status: CombatTrackerStatus.InProgress,
        rank: 4,
    },
];
