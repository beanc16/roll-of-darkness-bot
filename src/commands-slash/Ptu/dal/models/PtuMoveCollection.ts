import { ObjectId } from 'mongodb';

import type {
    PokemonMoveCategory,
    PokemonType,
    PtuContestStatEffect,
    PtuContestStatType,
} from '../../types/pokemon.js';
import { PtuMoveFrequency } from '../../types/pokemon.js';

export enum PtuMoveStatus
{
    DRAFT = 'Draft',
    READY_FOR_REVIEW = 'Ready for Review',
    FAILED_REVIEW = 'Failed Review',
    PASSED_REVIEW = 'Passed Review',
}

export enum PtuCustomMoveFrequency
{
    AtWill = PtuMoveFrequency.AtWill,
    EoT = PtuMoveFrequency.EoT,
    SceneX2 = PtuMoveFrequency.SceneX2,
    Scene = PtuMoveFrequency.Scene,
    DailyX3 = PtuMoveFrequency.DailyX3,
    DailyX2 = PtuMoveFrequency.DailyX2,
    Daily = PtuMoveFrequency.Daily,
    Static = PtuMoveFrequency.Static,
    Free = PtuMoveFrequency.Free,
    SeeEffect = PtuMoveFrequency.SeeEffect,
}

export enum PtuCustomMoveDamageBase
{
    None = '--',
    SeeEffect = 'See Effect',
    XSeeEffect = 'X, See Effect',
    One = 1,
    Two = 2,
    Three = 3,
    Four = 4,
    Five = 5,
    Six = 6,
    Seven = 7,
    Eight = 8,
    Nine = 9,
    Ten = 10,
    Eleven = 11,
    Twelve = 12,
    Thirteen = 13,
    Fourteen = 14,
    Fifteen = 15,
    Sixteen = 16,
    Seventeen = 17,
    Eighteen = 18,
    Nineteen = 19,
    Twenty = 20,
    TwentyOne = 21,
    TwentyTwo = 22,
    TwentyThree = 23,
    TwentyFour = 24,
    TwentyFive = 25,
    FifteenDamage = '15 Damage',
}

export enum PtuCustomMoveArmorClass
{
    None = '--',
    SeeEffect = 'See Effect',
    One = 1,
    Two = 2,
    Three = 3,
    Four = 4,
    Five = 5,
    Six = 6,
    Seven = 7,
    Eight = 8,
    Nine = 9,
    Ten = 10,
}

export enum PtuCustomMoveRangeOptions
{
    // Distance
    Melee = 'Melee',
    Self = 'Self',
    Two = 2,
    Three = 3,
    Four = 4,
    Five = 5,
    Six = 6,
    Seven = 7,
    Eight = 8,
    Nine = 9,
    Ten = 10,
    Eleven = 11,
    Twelve = 12,
    Thirteen = 13,
    Fourteen = 14,
    Fifteen = 15,
    WeaponRange = 'WR',
    Any = 'Any',

    // Number of Targets
    OneTarget = '1 Target',
    TwoTargets = '2 Targets',
    ThreeTargets = '3 Targets',
    FourTargets = '4 Targets',
    FiveTargets = '5 Targets',
    AllAdjacentFoes = 'All Adjacent Foes',
    AllCardinallyAdjacentTargets = 'All Cardinally Adjacent Targets',

    // Line
    LineTwo = 'Line 2',
    LineThree = 'Line 3',
    LineFour = 'Line 4',
    LineFive = 'Line 5',
    LineSix = 'Line 6',
    LineSeven = 'Line 7',
    LineEight = 'Line 8',
    LineNine = 'Line 9',

    // Cone
    ConeTwo = 'Cone 2',
    ConeThree = 'Cone 3',

    // Burst
    BurstOne = 'Burst 1',
    BurstTwo = 'Burst 2',
    BurstThree = 'Burst 3',
    BurstFour = 'Burst 4',
    BurstFive = 'Burst 5',
    BurstSix = 'Burst 6',
    BurstSeven = 'Burst 7',
    BurstEight = 'Burst 8',
    BurstNine = 'Burst 9',
    BurstTen = 'Burst 10',

    // Close Blast
    CloseBlastTwo = 'Close Blast 2',
    CloseBlastThree = 'Close Blast 3',

    // Ranged Blast
    RangedBlastTwo = 'Ranged Blast 2',
    RangedBlastThree = 'Ranged Blast 3',

    // Miscellaneous
    SeeEffect = 'See Effect',

    // Action Types
    FreeAction = 'Free Action',
    FullAction = 'Full Action',
    Interrupt = 'Interrupt',
    Priority = 'Priority',
    PriorityLimited = 'Priority (Limited)',
    Reaction = 'Reaction',
    SwiftAction = 'Swift Action',
    Trigger = 'Trigger',
}

export class PtuMoveCollection
{
    public _id: ObjectId;
    public name: string;
    public type?: PokemonType;
    public category?: PokemonMoveCategory;
    public frequency?: PtuCustomMoveFrequency;
    public damageBase: PtuCustomMoveDamageBase;
    public ac: PtuCustomMoveArmorClass;
    public keywords: [string?, string?, string?, string?];
    public rangeOptions: PtuCustomMoveRangeOptions[];
    public effects?: string;
    public contestStatEffect?: PtuContestStatEffect;
    public contestStatType?: PtuContestStatType;
    public basedOn?: string;

    // State Management
    public status: PtuMoveStatus;
    public editorDiscordUserIds: string[];
    public isTransferred?: boolean = false;
    public isDeleted?: boolean = false;
    public deletedAt?: Date;

    constructor({
        _id,
        name,
        type,
        category,
        frequency,
        damageBase,
        ac,
        keywords = [],
        rangeOptions,
        effects,
        contestStatEffect,
        contestStatType,
        basedOn,
        status = PtuMoveStatus.DRAFT,
        editorDiscordUserIds,
    }: {
        _id?: ObjectId;
        name: string;
        type: PokemonType | undefined;
        category: PokemonMoveCategory;
        frequency: PtuCustomMoveFrequency;
        damageBase: PtuCustomMoveDamageBase;
        ac: PtuCustomMoveArmorClass;
        keywords?: [string?, string?, string?, string?];
        rangeOptions: PtuCustomMoveRangeOptions[];
        effects: string;
        contestStatEffect?: PtuContestStatEffect;
        contestStatType?: PtuContestStatType;
        basedOn?: string;
        status?: PtuMoveStatus;
        editorDiscordUserIds: string[];
    })
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
        this.type = type;
        this.category = category;
        this.frequency = frequency;
        this.damageBase = damageBase;
        this.ac = ac;
        this.keywords = keywords;
        this.rangeOptions = rangeOptions;
        this.effects = effects;
        this.contestStatEffect = contestStatEffect;
        this.contestStatType = contestStatType;
        this.basedOn = basedOn;
        this.status = status;
        this.editorDiscordUserIds = editorDiscordUserIds;
    }

    get id(): ObjectId
    {
        // eslint-disable-next-line no-underscore-dangle -- Use an underscore to properly interface with mongodb's default _id property
        return this._id;
    }
}
