import { StringSelectMenuOptionBuilder } from 'discord.js';

import { CombatTrackerType } from '../../../constants/combatTracker';

// HP Options
const editCharacterHpOption = new StringSelectMenuOptionBuilder()
    .setLabel('Edit Character HP')
    .setDescription(`Edit a character's HP value`)
    .setValue('edit_hp_button')
    .setEmoji({ name: '❤' })
    .setDefault(false);

const addCharacterOption = new StringSelectMenuOptionBuilder()
    .setLabel('Add Character')
    .setDescription(`Add a character to combat`)
    .setValue('add_character_button')
    .setEmoji({ name: '🏃' })
    .setDefault(false);

const showSecretCharactersOption = new StringSelectMenuOptionBuilder()
    .setLabel('Show Secret Characters')
    .setDescription(`Send the initiative order with secret information visible (that only you can see)`)
    .setValue('show_secret_characters_button')
    .setEmoji({ name: '👀' })
    .setDefault(false);

const editCharacterOption = new StringSelectMenuOptionBuilder()
    .setLabel('Edit Character')
    .setDescription(`Edit a character's name or initiative value`)
    .setValue('edit_character_button')
    .setEmoji({ name: '📝' })
    .setDefault(false);

const removeCharacterOption = new StringSelectMenuOptionBuilder()
    .setLabel('Remove Character')
    .setDescription(`Remove a character from combat`)
    .setValue('remove_character_button')
    .setEmoji({ name: '❌' })
    .setDefault(false);

// Initiative Options
const nextTurnOption = new StringSelectMenuOptionBuilder()
    .setLabel('Next Turn')
    .setDescription(`Go to the next turn in the initiative order`)
    .setValue('next_turn_button')
    .setEmoji({ name: '⏭' })
    .setDefault(false);

const previousTurnOption = new StringSelectMenuOptionBuilder()
    .setLabel('Previous Turn')
    .setDescription(`Go to the previous turn in the initiative order`)
    .setValue('previous_turn_button')
    .setEmoji({ name: '⏮' })
    .setDefault(false);

const moveTurnOption = new StringSelectMenuOptionBuilder()
    .setLabel('Move Turn')
    .setDescription(`Move to a specific turn in the initiative order`)
    .setValue('move_turn_button')
    .setEmoji({ name: '↪' })
    .setDefault(false);

const startCombatOption = new StringSelectMenuOptionBuilder()
    .setLabel('Start Combat')
    .setDescription(`Start tracking turns in the initiative order`)
    .setValue('start_combat_button')
    .setEmoji({ name: '▶' })
    .setDefault(false);

const endCombatOption = new StringSelectMenuOptionBuilder()
    .setLabel('End Combat')
    .setDescription(`Stop tracking turns in the initiative order`)
    .setValue('end_combat_button')
    .setEmoji({ name: '🏁' })
    .setDefault(false);

export interface CombatTrackerOption
{
    option: StringSelectMenuOptionBuilder;
    menu: CombatTrackerType;
    type: CombatTrackerType;
    rank: number;
}

export const combatTrackerOptions: CombatTrackerOption[] = [
    {
        option: editCharacterHpOption,
        menu: CombatTrackerType.Hp,
        type: CombatTrackerType.Hp,
        rank: 0,
    },
    {
        option: addCharacterOption,
        menu: CombatTrackerType.Hp,
        type: CombatTrackerType.All,
        rank: 1,
    },
    {
        option: showSecretCharactersOption,
        menu: CombatTrackerType.Hp,
        type: CombatTrackerType.All,
        rank: 2,
    },
    {
        option: editCharacterOption,
        menu: CombatTrackerType.Hp,
        type: CombatTrackerType.All,
        rank: 3,
    },
    {
        option: removeCharacterOption,
        menu: CombatTrackerType.Hp,
        type: CombatTrackerType.All,
        rank: 4,
    },
    {
        option: nextTurnOption,
        menu: CombatTrackerType.Initiative,
        type: CombatTrackerType.Initiative,
        rank: 0,
    },
    {
        option: previousTurnOption,
        menu: CombatTrackerType.Initiative,
        type: CombatTrackerType.Initiative,
        rank: 1,
    },
    {
        option: moveTurnOption,
        menu: CombatTrackerType.Initiative,
        type: CombatTrackerType.Initiative,
        rank: 2,
    },
    {
        option: startCombatOption,
        menu: CombatTrackerType.Initiative,
        type: CombatTrackerType.All,
        rank: 3,
    },
    {
        option: endCombatOption,
        menu: CombatTrackerType.Initiative,
        type: CombatTrackerType.All,
        rank: 4,
    },
];
