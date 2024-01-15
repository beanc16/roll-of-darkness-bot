const { MongoDbControllerWithEnv } = require('mongodb-controller'); // TODO: Update this to use import rather than require syntax once this package has types.
import { ObjectId } from 'mongodb';
import { CombatTrackerStatus, CombatTrackerType } from '../constants/combatTracker';

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

// Shared values
interface DiscordCreator
{
    userId: string;
    serverId: string;
}

// Tracker Collection
interface TrackerConstructor
{
    _id?: ObjectId;
    name: string;
    status: CombatTrackerStatus;
    type: CombatTrackerType;
    round: number;
    currentTurn: number;
    characterIds: ObjectId[];
    discordCreator: (DiscordCreator &
    {
        messageId: string;
    });
    expireAt: Date;
}

export class Tracker
{
    _id: TrackerConstructor['_id'];
    name: TrackerConstructor['name'];
    status: TrackerConstructor['status'];
    type: TrackerConstructor['type'];
    round: TrackerConstructor['round'];
    currentTurn: TrackerConstructor['currentTurn'];
    characterIds: TrackerConstructor['characterIds'];
    discordCreator: TrackerConstructor['discordCreator'];
    expireAt: TrackerConstructor['expireAt'];

    constructor({
        _id,
        name,
        status = CombatTrackerStatus.NotStarted,
        type = CombatTrackerType.All,
        round = -1,
        currentTurn = 0,
        characterIds = [],
        discordCreator,
        expireAt = getDefaultExpireAt(),
    }: TrackerConstructor)
    {
        if (_id)
        {
            this._id = _id;
        }
        else
        {
            this._id = new ObjectId();
        }

        this.name = name;
        this.status = status;
        this.type = type;
        this.round = round;
        this.currentTurn = currentTurn;
        this.characterIds = characterIds;
        this.discordCreator = discordCreator;
        this.expireAt = expireAt;
    }
}

// TODO: Get this as MongoDbResults from mongodb-controller when it has types.
export interface TrackerResponse
{
    results: {
        model: Tracker;
        result: object;
    };
    error: Error | null;
    statusCode: number;
}

// TODO: Get this as MongoDbResults from mongodb-controller when it has types.
export interface TrackerUpdateResponse
{
    results: {
        old: Tracker;
        new: Tracker;
    };
    error: Error | null;
    statusCode: number;
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
    discordCreator: DiscordCreator;
    expireAt: Date;
}

export class Character
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
        else
        {
            this._id = new ObjectId();
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

// TODO: Get this as MongoDbResults from mongodb-controller when it has types.
export interface CharacterResponse
{
    results: {
        model: Character;
        result: object;
    };
    error: Error | null;
    statusCode: number;
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

// TODO: Get this as MongoDbResults from mongodb-controller when it has types.
export interface AggregatedTrackerWithCharactersResponse
{
    results: AggregatedTrackerWithCharacters[];
    error: Error | null;
    statusCode: number;
}

export class AggregatedTrackerWithCharacters
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
            $unset: "characterIds",
        },
    ];

    // TODO: Update type for accuracy.
    static async getAll(): Promise<AggregatedTrackerWithCharactersResponse>
    {
        return await this.aggregate(this.aggregateArrayOptions);
    }

    // TODO: Update type for accuracy.
    static async getByTrackerName(name: string): Promise<AggregatedTrackerWithCharactersResponse>
    {
        return await this.aggregate([
            {
                $match: {
                    name,
                },
            },
            ...this.aggregateArrayOptions,
        ]);
    }
}