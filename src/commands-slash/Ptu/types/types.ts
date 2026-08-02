import type { PtuFakemonDexType } from '../dal/models/PtuFakemonCollection.js';

export enum PtuSkillRank
{
    Pathetic = 'Pathetic',
    Untrained = 'Untrained',
    Novice = 'Novice',
    Adept = 'Adept',
    Expert = 'Expert',
    Master = 'Master',
    Virtuoso = 'Virtuoso',
}

export enum PtuFeatureTag
{
    Any = 'Any',
    HP = 'HP',
    Attack = 'Attack',
    Defense = 'Defense',
    SpecialAttack = 'Special Attack',
    SpecialDefense = 'Special Defense',
    Speed = 'Speed',
    Special = 'Special',
    PatronStat = 'Patron Stat',
    Class = 'Class',
    Branch = 'Branch',
    Ranked = 'Ranked',
    Weapon = 'Weapon',
    Orders = 'Orders',
    Strategem = 'Strategem',
    ResearchField = 'Research Field',
    Training = 'Training',
}

export enum PtuDexType
{
    Playtest = 'Playtest',
    Alola = 'Alola',
    Hisui = 'Hisui',
    Galar = 'Galar',
    Paldea = 'Paldea',
    ZA = 'ZA',
}

export type AllPtuDexTypes = PtuDexType
    | PtuFakemonDexType
    | `${PtuDexType} Dex`
    | `${PtuFakemonDexType} Dex`;
