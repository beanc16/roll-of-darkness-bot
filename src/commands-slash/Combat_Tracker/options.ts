import { SlashCommandStringOption } from 'discord.js';

import { CombatTrackerType } from './types.js';

export function name(option: SlashCommandStringOption)
{
    option.setName('name');
    option.setDescription('The unique name of the combat.');
    option.setMinLength(1);
    option.setRequired(true);
    return option;
}

export function type(option: SlashCommandStringOption)
{
    option.setName('type');
    option.setDescription('The type of combat tracker to use (default: All).');
    option.addChoices(
        {
            name: CombatTrackerType.All,
            value: CombatTrackerType.All,
        },
        {
            name: CombatTrackerType.Hp,
            value: CombatTrackerType.Hp,
        },
        {
            name: CombatTrackerType.Initiative,
            value: CombatTrackerType.Initiative,
        },
    );
    return option;
}
