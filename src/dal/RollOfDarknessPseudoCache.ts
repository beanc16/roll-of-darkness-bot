import { CommandInteraction, Message } from 'discord.js';
import {
    AggregatedTrackerWithCharactersController,
    // CharacterController,
    TrackerController, 
    TrackerResponse,
    TrackerUpdateResponse,
} from './RollOfDarknessMongoControllers';
import { CombatTrackerStatus } from '../constants/combatTracker';
import combatTrackersSingleton from '../models/combatTrackersSingleton';

interface GetTrackerParameters
{
    trackerName: string;
}

interface CreateTrackerParameters
{
    trackerName: string;
    interaction: CommandInteraction;
    message: Message;
}

interface UpdateTrackerStatusParameters
{
    status: CombatTrackerStatus;
    message: Message;
}

export class RollOfDarknessPseudoCache
{
    static async getTracker({
        trackerName
    }: GetTrackerParameters)
    {
        const {
            results: [
                tracker,
            ] = [],
        } = await AggregatedTrackerWithCharactersController.getByTrackerName(trackerName);

        return tracker;
    }

    static async createTracker({
        trackerName,
        interaction,
        message,
    }: CreateTrackerParameters): Promise<TrackerResponse['results']['model']>
    {
        const {
            results: {
                model: tracker,
            },
        } = await TrackerController.insertOneIfNotExists({
            // Find objects with the same name
            name: trackerName,
        }, {
            // If none are found, insert a tracker with this name
            name: trackerName,
            discordCreator: {
                userId: interaction.user.id,
                serverId: interaction.guild?.id,
                messageId: message.id,
            },
        }) as TrackerResponse;

        combatTrackersSingleton.upsert(message.id, tracker);
        return tracker;
    }

    static async updateTrackerStatus({
        status,
        message,
    } : UpdateTrackerStatusParameters): Promise<TrackerUpdateResponse['results']['new']>
    {
        const oldTracker = combatTrackersSingleton.get(message.id);

        const {
            results: {
                new: tracker,
            },
        } = await TrackerController.findOneAndUpdate({
            // Find objects with the same name
            name: oldTracker.name,
        }, {
            // If one is found, update the status to say the combat has started
            status,
            ...(status === CombatTrackerStatus.InProgress
                ? { round: 1 } // Set to the first round if just starting combat
                : {}
            ),
        }) as TrackerUpdateResponse;

        combatTrackersSingleton.upsert(message.id, tracker);
        return tracker;
    }
}
