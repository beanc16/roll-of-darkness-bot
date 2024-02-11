import { CommandInteraction, Message, ModalSubmitInteraction } from 'discord.js';
import {
    Character,
    CharacterController,
    CharacterResponse,
    CharacterUpdateResponse,
    Tracker,
    TrackerController, 
    TrackerResponse,
    TrackerUpdateResponse,
} from './RollOfDarknessMongoControllers';
import { CombatTrackerStatus, CombatTrackerType } from '../constants/combatTracker';
import combatTrackersSingleton from '../models/combatTrackersSingleton';
import charactersSingleton from '../models/charactersSingleton';
import { WorldOfDarknessHpService } from '../services/WorldOfDarknessHpService';

interface CreateTrackerParameters
{
    trackerName: string;
    trackerType: CombatTrackerType;
    interaction: CommandInteraction;
    message: Message;
    onTrackerAlreadyExists?: (interaction: CommandInteraction) => Promise<void>;
}

interface UpdateTrackerStatusParameters
{
    status: CombatTrackerStatus;
    tracker: Tracker;
}

interface GetCharactersParameters
{
    tracker: Tracker;
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

interface EditCharacterHpParameters
{
    tracker: Tracker;
    interaction: CommandInteraction;
    characterName: string;
    hpType: 'damaged' | 'healed' | 'downgraded'; // TODO: Make this a shared type with the discord layer
    damageToDo: number;
    bashingDamage?: number;
    lethalDamage?: number;
    aggravatedDamage?: number;
    onCharacterNotFound?: (interaction: CommandInteraction) => Promise<void>;
}

export class RollOfDarknessPseudoCache
{
    static async createTracker({
        trackerName,
        trackerType,
        interaction,
        message,
        onTrackerAlreadyExists = async (interaction) =>
        {
            // Send response
            await interaction.editReply({
                content: `Failed to create tracker because a tracker named ${trackerName} already exists`,
            });
        },
    }: CreateTrackerParameters): Promise<TrackerResponse['results']['model'] | undefined>
    {
        try
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
                type: trackerType,
                discordCreator: {
                    userId: interaction.user.id,
                    serverId: interaction.guild?.id,
                    messageId: message.id,
                },
            }) as TrackerResponse;

            combatTrackersSingleton.upsert(tracker);
            return tracker;
        }
        catch ({ error }: any)
        {
            if (onTrackerAlreadyExists && error.name === 'DocumentAlreadyExistsError')
            {
                await onTrackerAlreadyExists(interaction);
            }

            return undefined;
        }
    }

    static async updateTrackerStatus({
        status,
        tracker: oldTracker,
    } : UpdateTrackerStatusParameters): Promise<TrackerUpdateResponse['results']['new']>
    {
        // TODO: Handle tracker does not exists.
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

        combatTrackersSingleton.upsert(tracker);
        return tracker;
    }

    static getCharacters({
        tracker
    }: GetCharactersParameters): Character[]
    {
        const trackerId = tracker._id?.toString() as string;
        return charactersSingleton.get(trackerId);
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

        combatTrackersSingleton.upsert(tracker);
        charactersSingleton.upsert(tracker._id?.toString() as string, character);

        return {
            character,
            tracker,
        };
    }

    // TODO: Type parameters and output.
    static async editCharacterHp({
        tracker,
        interaction,
        characterName,
        hpType,
        damageToDo,
        bashingDamage = 0,
        lethalDamage = 0,
        aggravatedDamage = 0,
        onCharacterNotFound = async (interaction) =>
        {
            // Send response
            await interaction.editReply({
                content: `Failed to edit character hp because a character named ${characterName} was not found`,
            });
        },
    }: EditCharacterHpParameters): Promise<CharacterResponse['results']['model'] | undefined>
    {
        const characters = this.getCharacters({ tracker });
        const characterToEdit = characters.find((character) => character.name === characterName);

        if (!characterToEdit)
        {
            onCharacterNotFound(interaction);
            return undefined;
        }
        else
        {
            const damageType = (aggravatedDamage > 0)
                ? 'agg'
                : (lethalDamage > 0)
                ? 'lethal'
                : 'bashing';

            const editHpBy = {
                damaged: () => WorldOfDarknessHpService.damage({
                    maxHp: characterToEdit.maxHp,
                    bashingDamage: bashingDamage || characterToEdit.currentDamage.bashing,
                    lethalDamage: bashingDamage || characterToEdit.currentDamage.lethal,
                    aggravatedDamage: bashingDamage || characterToEdit.currentDamage.aggravated,
                    amount: damageToDo,
                    damageType,
                }),
                healed: () => WorldOfDarknessHpService.heal({
                    maxHp: characterToEdit.maxHp,
                    bashingDamage: bashingDamage || characterToEdit.currentDamage.bashing,
                    lethalDamage: bashingDamage || characterToEdit.currentDamage.lethal,
                    aggravatedDamage: bashingDamage || characterToEdit.currentDamage.aggravated,
                    amount: damageToDo,
                    damageType,
                }),
                downgraded: () => WorldOfDarknessHpService.downgrade({
                    maxHp: characterToEdit.maxHp,
                    bashingDamage: bashingDamage || characterToEdit.currentDamage.bashing,
                    lethalDamage: bashingDamage || characterToEdit.currentDamage.lethal,
                    aggravatedDamage: bashingDamage || characterToEdit.currentDamage.aggravated,
                    amount: damageToDo,
                    damageType,
                }),
            };

            const {
                newBashingDamage,
                newLethalDamage,
                newAggravatedDamage,
            } = editHpBy[hpType]();

            const {
                results: {
                    new: editedCharacter,
                },
            } = await CharacterController.findOneAndUpdate({
                name: characterToEdit.name,
            }, {
                // If one is found, update the current damage
                currentDamage: {
                    bashing: newBashingDamage,
                    lethal: newLethalDamage,
                    aggravated: newAggravatedDamage,
                },
            }) as CharacterUpdateResponse;

            charactersSingleton.upsert(tracker._id?.toString() as string, editedCharacter);

            return editedCharacter;
        }
    };
}
