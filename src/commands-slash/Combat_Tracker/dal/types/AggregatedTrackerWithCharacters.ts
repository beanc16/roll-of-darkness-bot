import { ObjectId } from 'mongodb';

import { CombatTrackerStatus } from '../../types.js';
import { Character } from './Character.js';

interface AggregatedTrackerWithCharactersConstructor
{
    _id?: ObjectId;
    name: string;
    status: CombatTrackerStatus;
    round: number;
    currentTurn: number;
    characters: Character[];
    createdAt: Date;
}

export class AggregatedTrackerWithCharacters
{
    private _id: AggregatedTrackerWithCharactersConstructor['_id'];
    public name: AggregatedTrackerWithCharactersConstructor['name'];
    public status: AggregatedTrackerWithCharactersConstructor['status'];
    public round: AggregatedTrackerWithCharactersConstructor['round'];
    public currentTurn: AggregatedTrackerWithCharactersConstructor['currentTurn'];
    public characters: AggregatedTrackerWithCharactersConstructor['characters'];
    public createdAt: AggregatedTrackerWithCharactersConstructor['createdAt'];

    constructor({
        _id,
        name,
        status = CombatTrackerStatus.NotStarted,
        round = -1,
        currentTurn = 0,
        characters = [],
        createdAt = new Date(),
    }: AggregatedTrackerWithCharactersConstructor)
    {
        if (_id)
        {
            // eslint-disable-next-line no-underscore-dangle -- Use an underscore to properly interface with mongodb's default _id property
            this._id = _id;
        }

        this.name = name;
        this.status = status;
        this.round = round;
        this.currentTurn = currentTurn;
        this.characters = characters;
        this.createdAt = createdAt;
    }

    get id(): ObjectId | undefined
    {
        // eslint-disable-next-line no-underscore-dangle -- Use an underscore to properly interface with mongodb's default _id property
        return this._id;
    }
}
