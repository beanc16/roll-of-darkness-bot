import { StringSelectMenuInteraction } from 'discord.js';

import { Tracker } from '../../dal/AggregatedTrackerWithCharactersController.js';

export interface CombatTrackerMessageComponentHandlerParameters
{
    interaction: StringSelectMenuInteraction;
    tracker: Tracker;
}
