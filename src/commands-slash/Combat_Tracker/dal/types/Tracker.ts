import { ObjectId } from 'mongodb';

import { CombatTrackerStatus, CombatTrackerType } from '../../types.js';
import { DiscordCreator } from './shared.js';

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
        }
    );
    createdAt: Date;
}

export class Tracker
{
    private _id: NonNullable<TrackerConstructor['_id']>;
    public name: TrackerConstructor['name'];
    public status: TrackerConstructor['status'];
    public type: TrackerConstructor['type'];
    public round: TrackerConstructor['round'];
    public currentTurn: TrackerConstructor['currentTurn'];
    public characterIds: TrackerConstructor['characterIds'];
    public discordCreator: TrackerConstructor['discordCreator'];
    public createdAt: TrackerConstructor['createdAt'];

    constructor({
        _id,
        name,
        status = CombatTrackerStatus.NotStarted,
        type = CombatTrackerType.All,
        round = -1,
        currentTurn = 0,
        characterIds = [],
        discordCreator,
        createdAt = new Date(),
    }: TrackerConstructor)
    {
        if (_id)
        {
            // eslint-disable-next-line no-underscore-dangle -- Use an underscore to properly interface with mongodb's default _id property
            this._id = _id;
        }
        else
        {
            // eslint-disable-next-line no-underscore-dangle -- Use an underscore to properly interface with mongodb's default _id property
            this._id = new ObjectId();
        }

        this.name = name;
        this.status = status;
        this.type = type;
        this.round = round;
        this.currentTurn = currentTurn;
        this.characterIds = characterIds;
        this.discordCreator = discordCreator;
        this.createdAt = createdAt;
    }

    get id(): ObjectId
    {
        // eslint-disable-next-line no-underscore-dangle -- Use an underscore to properly interface with mongodb's default _id property
        return this._id;
    }
}
