import { StringSelectMenuInteraction } from 'discord.js';
import { Tracker } from '../../../../dal/RollOfDarknessMongoControllers.js';

export interface CombatTrackerMessageComponentHandlerParameters
{
    interaction: StringSelectMenuInteraction;
    tracker: Tracker;
}
