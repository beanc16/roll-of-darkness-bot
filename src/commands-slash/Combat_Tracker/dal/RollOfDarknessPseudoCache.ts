import {
    CommandInteraction,
    Message,
    ModalSubmitInteraction,
} from 'discord.js';

import charactersSingleton from '../../../models/charactersSingleton.js';
import combatTrackersSingleton from '../../../models/combatTrackersSingleton.js';
import { WorldOfDarknessHpService } from '../services/WorldOfDarknessHpService.js';
import {
    CombatTrackerStatus,
    CombatTrackerType,
    DamageType,
    HpType,
} from '../types.js';
import { AggregatedTrackerWithCharactersController } from './AggregatedTrackerWithCharactersController.js';
import {
    CharacterController,
    CharacterResponse,
    CharacterUpdateResponse,
} from './CharacterController.js';
import {
    TrackerController,
    TrackerResponse,
    TrackerUpdateResponse,
} from './TrackerController.js';
import { Character } from './types/Character.js';
import { Tracker } from './types/Tracker.js';

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

interface NextTurnParameters
{
    tracker: Tracker;
}

type PreviousTurnParameters = NextTurnParameters;

interface MoveTurnParameters extends NextTurnParameters
{
    turn: number;
}

interface GetCharactersParameters
{
    tracker: Tracker;
}

interface GetCharactersAndCurrentTurnResponse
{
    characters: Character[];
    currentTurn: number;
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
    tracker: Tracker;
}

interface CreateCharacterResponse
{
    character: CharacterResponse['results']['model'];
    tracker: TrackerResponse['results']['model'];
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

interface EditCharacterHpResponse
{
    character?: CharacterResponse['results']['model'];
    tracker?: TrackerResponse['results']['model'];
}

interface DeleteCharacterParameters
{
    tracker: Tracker;
    interaction: ModalSubmitInteraction;
    characterName: string;
    onCharacterNotFound?: (interaction: ModalSubmitInteraction) => Promise<void>;
}

interface UpdateTurnParameters
{
    oldTracker: Tracker;
    updatedTurn: number;
    updatedRound?: number;
}

export class RollOfDarknessPseudoCache
{
    public static async createTracker({
        trackerName,
        trackerType,
        interaction,
        message,
        onTrackerAlreadyExists = async (trackerAlreadyExistsInteraction) =>
        {
            // Send response
            await trackerAlreadyExistsInteraction.followUp({
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Fix this later if necessary
        catch ({ error }: any)
        {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Fix this later if necessary
            if (onTrackerAlreadyExists && error.name === 'DocumentAlreadyExistsError')
            {
                await onTrackerAlreadyExists(interaction);
            }

            return undefined;
        }
    }

    public static async updateTrackerStatus({ status, tracker: oldTracker }: UpdateTrackerStatusParameters): Promise<TrackerUpdateResponse['results']['new']>
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

    public static async nextTurn({
        tracker: oldTracker,
    }: NextTurnParameters): Promise<TrackerUpdateResponse['results']['new']>
    {
        const { characters, currentTurn } = await this.getCharactersAndCurrentTurn({ tracker: oldTracker });

        const updatedTurn = (currentTurn + 1 < characters.length)
            ? currentTurn + 1
            : 0;

        const updatedRound = (currentTurn + 1 >= characters.length)
            ? oldTracker.round + 1
            : undefined;

        return await this.updateTurn({
            oldTracker,
            updatedTurn,
            updatedRound,
        });
    }

    public static async previousTurn({
        tracker: oldTracker,
    }: PreviousTurnParameters): Promise<TrackerUpdateResponse['results']['new'] | false>
    {
        const { characters, currentTurn } = await this.getCharactersAndCurrentTurn({ tracker: oldTracker });

        const updatedTurn = (currentTurn - 1 >= 0)
            ? currentTurn - 1
            : characters.length - 1;

        const updatedRound = (currentTurn - 1 < 0)
            ? oldTracker.round - 1
            : undefined;

        if (updatedRound !== undefined && updatedRound < 1)
        {
            return false;
        }

        return await this.updateTurn({
            oldTracker,
            updatedTurn,
            updatedRound,
        });
    }

    public static async moveTurn({ tracker: oldTracker, turn }: MoveTurnParameters): Promise<TrackerUpdateResponse['results']['new'] | false>
    {
        const characters = await this.getCharacters({ tracker: oldTracker });

        const updatedTurn = (turn > 0 && turn <= characters.length)
            ? turn - 1
            : undefined;

        if (!updatedTurn)
        {
            // Return false if the turn is outside of the allowed range
            return false;
        }

        return await this.updateTurn({
            oldTracker,
            updatedTurn,
        });
    }

    public static async getCharacters({
        tracker,
    }: GetCharactersParameters): Promise<Character[]>
    {
        const trackerId = tracker.id.toString();
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

    private static async getCharacterByName({ tracker, characterName }: {
        tracker: Tracker;
        characterName: string;
    }): Promise<Character | undefined>
    {
        const characters = await this.getCharacters({ tracker });
        return characters.find(character => character.name === characterName);
    }

    public static async createCharacter({
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
        tracker: oldTracker,
    }: CreateCharacterParameters): Promise<CreateCharacterResponse>
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

        const characters = await this.getCharacters({ tracker: oldTracker });

        // Should update current turn if the new user has a higher initiative
        // than the character whose turn it currently is, so it stays on the
        // same character's turn.
        const shouldUpdateCurrentTurn = (
            characters.length > 0
            && oldTracker.status === CombatTrackerStatus.InProgress
            && character.initiative > characters[oldTracker.currentTurn].initiative
        );

        const {
            results: {
                new: tracker,
            },
        } = await TrackerController.findOneAndUpdate({
            // Find objects with the same name
            'discordCreator.messageId': message.id,
        }, {
            // If one is found, push into the characterIds array.
            characterIds: [
                ...oldTracker.characterIds,
                character.id,
            ],

            // If the current turn should be updated, add 1
            ...(shouldUpdateCurrentTurn
                ? { currentTurn: oldTracker.currentTurn + 1 }
                : {}
            ),
        }) as TrackerUpdateResponse;

        combatTrackersSingleton.upsert(tracker);
        charactersSingleton.upsert(tracker.id.toString(), character);

        return {
            character,
            tracker,
        };
    }

    public static async editCharacterHp({
        tracker,
        interaction,
        characterName,
        hpType,
        damageType,
        damageToDo,
        onCharacterNotFound = async (characterNotFoundInteraction) =>
        {
            // Send response
            await characterNotFoundInteraction.followUp({
                ephemeral: true,
                content: `Failed to edit character hp because a character named ${characterName} was not found`,
            });
        },
    }: EditCharacterHpParameters): Promise<EditCharacterHpResponse>
    {
        const character = await this.getCharacterByName({
            tracker,
            characterName,
        });

        if (!character)
        {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises -- Respond back to the base command quicker
            onCharacterNotFound(interaction);
            return {};
        }

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
            _id: character.id,
        }, {
            // If one is found, update the current damage
            currentDamage: {
                bashing: newBashingDamage,
                lethal: newLethalDamage,
                aggravated: newAggravatedDamage,
            },
        }) as CharacterUpdateResponse;

        charactersSingleton.upsert(tracker.id.toString(), editedCharacter);

        return {
            character: editedCharacter,
            tracker,
        };
    };

    public static async deleteCharacter({
        tracker,
        interaction,
        characterName,
        onCharacterNotFound = async (characterNotFoundnteraction) =>
        {
            // Send response
            await characterNotFoundnteraction.followUp({
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
            // eslint-disable-next-line @typescript-eslint/no-floating-promises -- Respond back to the base command quicker
            onCharacterNotFound(interaction);
        }
        else
        {
            // TODO: Handle character does not exist.
            await CharacterController.findOneAndDelete({
                _id: character.id,
            });

            // Remove the deleted character from the list of character IDs
            const newCharacterIds = tracker.characterIds.filter(element =>
                element.toString() === character.id.toString(),
            );

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
            charactersSingleton.delete(editedTracker.id.toString(), character);
        }
    }

    private static async getCharactersAndCurrentTurn({
        tracker,
    }: GetCharactersParameters): Promise<GetCharactersAndCurrentTurnResponse>
    {
        const trackerId = tracker.id.toString();
        const cachedTracker = combatTrackersSingleton.get(trackerId);
        const characters = charactersSingleton.get(trackerId);

        if (cachedTracker && characters)
        {
            return {
                characters,
                currentTurn: cachedTracker.currentTurn,
            };
        }

        const {
            results: [
                { characters: charactersFromDb = [], currentTurn = 0 } = {},
            ] = [{}],
        } = await AggregatedTrackerWithCharactersController.getByTrackerName(tracker.name);

        return {
            characters: charactersFromDb,
            currentTurn,
        };
    }

    private static async updateTurn({
        oldTracker,
        updatedTurn,
        updatedRound,
    }: UpdateTurnParameters): Promise<Tracker>
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
            // If one is found, update the current turn
            currentTurn: updatedTurn,
            ...(updatedRound !== undefined
                ? { round: updatedRound }
                : {}
            ),
        }) as TrackerUpdateResponse;

        combatTrackersSingleton.upsert(tracker);
        return tracker;
    }
}
