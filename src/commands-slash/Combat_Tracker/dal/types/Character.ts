import { ObjectId } from 'mongodb';

import { DiscordCreator } from './shared.js';

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
    createdAt: Date;
}

export class Character
{
    private _id: NonNullable<CharacterConstructor['_id']>;
    public name: CharacterConstructor['name'];
    public initiative: CharacterConstructor['initiative'];
    public maxHp: CharacterConstructor['maxHp'];
    public currentDamage: CharacterConstructor['currentDamage'];
    public isSecret: CharacterConstructor['isSecret'];
    public discordCreator: CharacterConstructor['discordCreator'];
    public createdAt: CharacterConstructor['createdAt'];

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
        createdAt = new Date(),
    }: CharacterConstructor)
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
        this.initiative = initiative;
        this.maxHp = maxHp;
        this.currentDamage = currentDamage;
        this.isSecret = isSecret;
        this.discordCreator = discordCreator;
        this.createdAt = createdAt;
    }

    get id(): ObjectId
    {
        // eslint-disable-next-line no-underscore-dangle -- Use an underscore to properly interface with mongodb's default _id property
        return this._id;
    }
}
