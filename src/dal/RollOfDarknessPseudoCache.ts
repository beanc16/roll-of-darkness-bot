import { CommandInteraction, Message, ModalSubmitInteraction } from 'discord.js';
import {
    AggregatedTrackerWithCharactersController,
    CharacterController,
    CharacterResponse,
    TrackerController, 
    TrackerResponse,
    TrackerUpdateResponse,
} from './RollOfDarknessMongoControllers';
import { CombatTrackerStatus } from '../constants/combatTracker';
import combatTrackersSingleton from '../models/combatTrackersSingleton';
import charactersSingleton from '../models/charactersSingleton';

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

interface CreateCharacterParameters
{
    characterName: string;
    initiative?: number;
    maxHp?: number;
    bashingDamage?: number;
    lethalDamage?: number;
    aggravatedDamage?: number;
    nameIsSecret: boolean;
    initiativeIsSecret: boolean;
    hpIsSecret: boolean;
    interaction: ModalSubmitInteraction;
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

    static async createCharacter({
        characterName,
        initiative,
        maxHp,
        bashingDamage,
        lethalDamage,
        aggravatedDamage,
        nameIsSecret,
        initiativeIsSecret,
        hpIsSecret,
        interaction,
        message,
    }: CreateCharacterParameters): Promise<{
        character: CharacterResponse['results']['model'],
        tracker: TrackerResponse['results']['model'],
    }>
    {
        const character = await CharacterController.insertOne({
            name: characterName,
            ...(initiative && { initiative }),
            ...(maxHp && { maxHp }),
            ...((bashingDamage || lethalDamage || aggravatedDamage) && {
                currentDamage: {
                    bashing: bashingDamage,
                    lethal: lethalDamage,
                    aggravated: aggravatedDamage,
                },
            }),
            isSecret: {
                name: nameIsSecret,
                initiative: initiativeIsSecret,
                hp: hpIsSecret,
            },
            discordCreator: {
                userId: interaction.user.id,
                serverId: interaction.guild?.id,
            },
        }) as CharacterResponse['results']['model'];

        const {
            results: {
                new: tracker,
            },
        } = await TrackerController.findOneAndUpdate({
            // Find objects with the same name
            'discordCreator.messageId': message.id,
        }, {
            // If one is found, push into the characterIds array.
            characterIds: character._id,
        }, {
            operator: 'push',
        }) as TrackerUpdateResponse;

        combatTrackersSingleton.upsert(message.id, tracker);
        charactersSingleton.upsert(tracker._id?.toString() as string, character);

        return {
            character,
            tracker,
        };
    }
}
