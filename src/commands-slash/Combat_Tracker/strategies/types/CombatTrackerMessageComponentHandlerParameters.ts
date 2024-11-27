import { StringSelectMenuInteraction } from 'discord.js';

import { Tracker } from '../../dal/types/Tracker.js';

export interface CombatTrackerMessageComponentHandlerParameters
{
    interaction: StringSelectMenuInteraction;
    tracker: Tracker;
}
