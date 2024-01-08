const { MongoDbControllerWithEnv } = require('mongodb-controller'); // TODO: Update this to use import rather than require syntax once this package has types.
import type { ObjectId } from 'mongodb';
import { CombatTrackerStatus } from '../constants/combatTracker';

// expiresAt helpers
function addMinutesToDate({
    date = new Date(),
    minutes,
} : {
    date?: Date;
    minutes: number;
}): Date
{
    // 1 minute === 60000 milliseconds
    const millisecondsToAdd = minutes * 60000;
    const unixTimestamp = date.getTime() + millisecondsToAdd;
    return new Date(unixTimestamp);
}

function getDefaultExpireAt(): Date
{
    return addMinutesToDate({
        minutes: 1440,
    });
}

// Tracker Collection
interface TrackerConstructor
{
    _id?: ObjectId;
    name: string;
    status: CombatTrackerStatus;
    round: number;
    currentTurn: number;
    characterIds: ObjectId[];
    expireAt: Date;
}

export class Tracker
{
    _id: TrackerConstructor['_id'];
    name: TrackerConstructor['name'];
    status: TrackerConstructor['status'];
    round: TrackerConstructor['round'];
    currentTurn: TrackerConstructor['currentTurn'];
    characterIds: TrackerConstructor['characterIds'];
    expireAt: TrackerConstructor['expireAt'];

    constructor({
        _id,
        name,
        status = CombatTrackerStatus.NotStarted,
        round = -1,
        currentTurn = 0,
        characterIds = [],
        expireAt = getDefaultExpireAt(),
    }: TrackerConstructor)
    {
        if (_id)
        {
            this._id = _id;
        }

        this.name = name;
        this.status = status;
        this.round = round;
        this.currentTurn = currentTurn;
        this.characterIds = characterIds;
        this.expireAt = expireAt;
    }
}

export class TrackerController extends MongoDbControllerWithEnv
{
    static collectionName = process.env.COLLECTION_TRACKER;
    static Model = Tracker;
}

// Character Collection
interface CharacterConstructor
{
    _id?: ObjectId;
    name: string;
    initiative: number;
    maxHp: number;
    currentDamage: {
        bashing: number;
        lethal: number;
        aggravated: number;
    };
    isSecret: {
        name: boolean;
        initiative: boolean;
        hp: boolean;
    };
    discordCreator: {
        userId: string;
        serverId: string;
    };
    expireAt: Date;
}

class Character
{
    _id: CharacterConstructor['_id'];
    name: CharacterConstructor['name'];
    initiative: CharacterConstructor['initiative'];
    maxHp: CharacterConstructor['maxHp'];
    currentDamage: CharacterConstructor['currentDamage'];
    isSecret: CharacterConstructor['isSecret'];
    discordCreator: CharacterConstructor['discordCreator'];
    expireAt: CharacterConstructor['expireAt'];

    constructor({
        _id,
        name,
        initiative = 0,
        maxHp = 6,
        currentDamage = {
            bashing: 0,
            lethal: 0,
            aggravated: 0,
        },
        isSecret = {
            name: false,
            initiative: false,
            hp: false,
        },
        discordCreator,
        expireAt = getDefaultExpireAt(),
    }: CharacterConstructor)
    {
        if (_id)
        {
            this._id = _id;
        }

        this.name = name;
        this.initiative = initiative;
        this.maxHp = maxHp;
        this.currentDamage = currentDamage;
        this.isSecret = isSecret;
        this.discordCreator = discordCreator;
        this.expireAt = expireAt;
    }
}

export class CharacterController extends MongoDbControllerWithEnv
{
    static collectionName = process.env.COLLECTION_CHARACTER;
    static Model = Character;
}

// Tracker & Character Aggregated Collection
interface AggregatedTrackerWithCharactersConstructor
{
    _id?: ObjectId;
    name: string;
    status: CombatTrackerStatus;
    round: number;
    currentTurn: number;
    characters: Character[];
    expireAt: Date;
}

class AggregatedTrackerWithCharacters
{
    _id: AggregatedTrackerWithCharactersConstructor['_id'];
    name: AggregatedTrackerWithCharactersConstructor['name'];
    status: AggregatedTrackerWithCharactersConstructor['status'];
    round: AggregatedTrackerWithCharactersConstructor['round'];
    currentTurn: AggregatedTrackerWithCharactersConstructor['currentTurn'];
    characters: AggregatedTrackerWithCharactersConstructor['characters'];
    expireAt: AggregatedTrackerWithCharactersConstructor['expireAt'];

    constructor({
        _id,
        name,
        status = CombatTrackerStatus.NotStarted,
        round = -1,
        currentTurn = 0,
        characters = [],
        expireAt = getDefaultExpireAt(),
    }: AggregatedTrackerWithCharactersConstructor)
    {
        if (_id)
        {
            this._id = _id;
        }

        this.name = name;
        this.status = status;
        this.round = round;
        this.currentTurn = currentTurn;
        this.characters = characters;
        this.expireAt = expireAt;
    }
}

export class AggregatedTrackerWithCharactersController extends MongoDbControllerWithEnv
{
    static collectionName = process.env.COLLECTION_TRACKER;
    static Model = AggregatedTrackerWithCharacters;

    // Calling AggregatedTrackerWithCharactersController.aggregate() will use this by default to return the Model set above.
    static aggregateArrayOptions = [
        {
            // Join tracker with character
            $lookup: {
                from: 'character',
                localField: 'characterIds',
                foreignField: '_id',
                as: 'characters',
            },
        },
        {
            // Exclude characterIds from the output (since it was only used for initial aggregation)
            $project: {
                characterIds: 0,
            },
        },
    ];
}
