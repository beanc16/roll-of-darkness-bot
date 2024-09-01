import { CommandInteraction, Message, ModalSubmitInteraction } from 'discord.js';
import {
    AggregatedTrackerWithCharactersController,
    Character,
    CharacterController,
    CharacterResponse,
    CharacterUpdateResponse,
    Tracker,
    TrackerController, 
    TrackerResponse,
    TrackerUpdateResponse,
} from './RollOfDarknessMongoControllers.js';
import { CombatTrackerStatus, CombatTrackerType, DamageType, HpType } from '../constants/combatTracker.js';
import combatTrackersSingleton from '../models/combatTrackersSingleton.js';
import charactersSingleton from '../models/charactersSingleton.js';
import { WorldOfDarknessHpService } from '../services/WorldOfDarknessHpService.js';

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
    interaction: ModalSubmitInteraction;
    characterName: string;
    hpType: HpType;
    damageType: DamageType;
    damageToDo: number;
    onCharacterNotFound?: (interaction: ModalSubmitInteraction) => Promise<void>;
}

interface DeleteCharacterParameters
{
    tracker: Tracker;
    interaction: ModalSubmitInteraction;
    characterName: string;
    onCharacterNotFound?: (interaction: ModalSubmitInteraction) => Promise<void>;
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
            await interaction.followUp({
                ephemeral: true,
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

    static async getCharacters({
        tracker
    }: GetCharactersParameters): Promise<Character[]>
    {
        const trackerId = tracker._id?.toString() as string;
        const characters = charactersSingleton.get(trackerId);

        if (characters)
        {
            return characters;
        }

        const {
            results: [
                {
                    characters: charactersFromDb = [],
                } = {},
            ] = [{}],
        } = await AggregatedTrackerWithCharactersController.getByTrackerName(tracker.name);

        return charactersFromDb;
    }

    static async getCharacterByName({
        tracker,
        characterName,
    }: {
        tracker: Tracker;
        characterName: string;
    }): Promise<Character | undefined>
    {
        const characters = await this.getCharacters({ tracker });
        return characters.find((character) => character.name === characterName);
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

    static async editCharacterHp({
        tracker,
        interaction,
        characterName,
        hpType,
        damageType,
        damageToDo,
        onCharacterNotFound = async (interaction) =>
        {
            // Send response
            await interaction.followUp({
                ephemeral: true,
                content: `Failed to edit character hp because a character named ${characterName} was not found`,
            });
        },
    }: EditCharacterHpParameters): Promise<{
        character?: CharacterResponse['results']['model'],
        tracker?: TrackerResponse['results']['model'],
    }>
    {
        const character = await this.getCharacterByName({
            tracker,
            characterName,
        });

        if (!character)
        {
            onCharacterNotFound(interaction);
            return {};
        }
        else
        {
            const editHpBy = {
                [HpType.Damage]: () => WorldOfDarknessHpService.damage({
                    maxHp: character.maxHp,
                    bashingDamage: character.currentDamage.bashing,
                    lethalDamage: character.currentDamage.lethal,
                    aggravatedDamage: character.currentDamage.aggravated,
                    amount: damageToDo,
                    damageType,
                }),
                [HpType.Heal]: () => WorldOfDarknessHpService.heal({
                    maxHp: character.maxHp,
                    bashingDamage: character.currentDamage.bashing,
                    lethalDamage: character.currentDamage.lethal,
                    aggravatedDamage: character.currentDamage.aggravated,
                    amount: damageToDo,
                    damageType,
                }),
                [HpType.Downgrade]: () => WorldOfDarknessHpService.downgrade({
                    maxHp: character.maxHp,
                    bashingDamage: character.currentDamage.bashing,
                    lethalDamage: character.currentDamage.lethal,
                    aggravatedDamage: character.currentDamage.aggravated,
                    amount: damageToDo,
                    damageType,
                }),
            };

            const {
                newBashingDamage,
                newLethalDamage,
                newAggravatedDamage,
            } = editHpBy[hpType]();

            // TODO: Handle character does not exists.
            const {
                results: {
                    new: editedCharacter,
                },
                        } = await CharacterController.findOneAndUpdate({
                _id: character._id,
            }, {
                // If one is found, update the current damage
                currentDamage: {
                    bashing: newBashingDamage,
                    lethal: newLethalDamage,
                    aggravated: newAggravatedDamage,
                },
            }) as CharacterUpdateResponse;

            charactersSingleton.upsert(tracker._id?.toString() as string, editedCharacter);

            return {
                character: editedCharacter,
                tracker,
            };
        }
    };

    static async deleteCharacter({
        tracker,
        interaction,
        characterName,
        onCharacterNotFound = async (interaction) =>
        {
            // Send response
            await interaction.followUp({
                ephemeral: true,
                content: `Failed to remove character because a character named ${characterName} was not found`,
            });
        },
    }: DeleteCharacterParameters): Promise<void>
    {
        const character = await this.getCharacterByName({
            tracker,
            characterName,
        });

        if (!character)
        {
            onCharacterNotFound(interaction);
        }
        else
        {
            // TODO: Handle character does not exist.
                        await CharacterController.findOneAndDelete({
                _id: character._id,
            });

            // Remove the deleted character from the list of character IDs
            const newCharacterIds = tracker.characterIds.filter(element => {
                return element.toString() === character._id?.toString();
            });

            // TODO: Handle tracker does not exists.
            const {
                results: {
                    new: editedTracker,
                },
                        } = await TrackerController.findOneAndUpdate({
                // Find objects with the same name
                name: tracker.name,
            }, {
                // If one is found, update the characterIds to remove the character
                characterIds: newCharacterIds,
            }) as TrackerUpdateResponse;

            combatTrackersSingleton.upsert(editedTracker);
            charactersSingleton.delete(editedTracker._id?.toString() as string, character);
        }
    };
}
