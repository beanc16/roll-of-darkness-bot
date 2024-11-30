export enum PokemonType
{
    Bug = 'Bug',
    Dark = 'Dark',
    Dragon = 'Dragon',
    Electric = 'Electric',
    Fairy = 'Fairy',
    Fighting = 'Fighting',
    Fire = 'Fire',
    Flying = 'Flying',
    Ghost = 'Ghost',
    Grass = 'Grass',
    Ground = 'Ground',
    Ice = 'Ice',
    Normal = 'Normal',
    Poison = 'Poison',
    Psychic = 'Psychic',
    Rock = 'Rock',
    Steel = 'Steel',
    Water = 'Water',
}

export enum PokemonTypeAndNone
{
    Bug = 'Bug',
    Dark = 'Dark',
    Dragon = 'Dragon',
    Electric = 'Electric',
    Fairy = 'Fairy',
    Fighting = 'Fighting',
    Fire = 'Fire',
    Flying = 'Flying',
    Ghost = 'Ghost',
    Grass = 'Grass',
    Ground = 'Ground',
    Ice = 'Ice',
    Normal = 'Normal',
    Poison = 'Poison',
    Psychic = 'Psychic',
    Rock = 'Rock',
    Steel = 'Steel',
    Water = 'Water',
    None = 'None',
}

export enum PokemonStat
{
    Hp = 'HP',
    Attack = 'ATK',
    Defense = 'DEF',
    SpecialAttack = 'SATK',
    SpecialDefense = 'SDEF',
    Speed = 'SPD',
}

export enum PokemonMoveCategory
{
    Physical = 'Physical',
    Special = 'Special',
    Status = 'Status',
    Versatile = 'Versatile',
    Static = 'Static',
}

export enum PtuMoveFrequency
{
    AtWill = 'At-Will',
    EoT = 'EOT',
    SceneX2 = 'Scene x2',
    Scene = 'Scene',
    DailyX3 = 'Daily x3',
    DailyX2 = 'Daily x2',
    Daily = 'Daily',
    Static = 'Static',
    Free = 'Free',
    Shift = 'Shift',
    Standard = 'Standard',
    FullActionInterupt = 'Full Action, Interrupt',
}

export enum PtuAbilityListType
{
    All = 'all',
    Basic = 'basicAbilities',
    Advanced = 'advancedAbilities',
    High = 'highAbility',
}

export enum PtuMoveListType
{
    All = 'all',
    EggMoves = 'eggMoves',
    LevelUp = 'levelUp',
    TmHm = 'tmHm',
    TutorMoves = 'tutorMoves',
    ZygardeCubeMoves = 'zygardeCubeMoves',
}

export enum PokemonStatusType
{
    Persistent = 'Persistent',
    Volatile = 'Volatile',
    Other = 'Other',
}

// TODO: Move this to a types package owned by an API that controls this data with PtuController later
export interface PtuPokemon
{
    name: string;
    types: string[];
    baseStats: {
        hp: number;
        attack: number;
        defense: number;
        specialAttack: number;
        specialDefense: number;
        speed: number;
    };
    abilities: {
        basicAbilities: string[];
        advancedAbilities: string[];
        highAbility: string;
    };
    evolution: {
        name: string;
        level: number;
        stage: number;
    }[];
    sizeInformation: {
        height: {
            freedom: string;
            metric: string;
            ptu: string;
        };
        weight: {
            freedom: string;
            metric: string;
            ptu: number;
        };
    };
    breedingInformation: {
        genderRatio: {
            male?: number;
            female?: number;
            none?: boolean;
        };
        eggGroups: string[];
        averageHatchRate?: string;
    };
    diets: string[];
    habitats: string[];
    capabilities: {
        overland: number;
        swim: number;
        sky: number;
        highJump: number;
        lowJump: number;
        power: number;
        other: string[];
    };
    skills: {
        athletics: string;
        acrobatics: string;
        combat: string;
        stealth: string;
        perception: string;
        focus: string;
    };
    moveList: {
        levelUp: {
            level: string | number;
            move: string;
            type: string;
        }[];
        tmHm: string[];
        eggMoves: string[];
        tutorMoves: string[];
        zygardeCubeMoves?: string[];
    };
    megaEvolutions?: {
        name: string;
        types: string[];
        ability: string;
        abilityShift?: string; // For Necrozma's ultra burst
        capabilities?: string[]; // For Necrozma's ultra burst
        stats: {
            hp?: string;
            attack?: string;
            defense?: string;
            specialAttack?: string;
            specialDefense?: string;
            speed?: string;
        };
    }[];
    metadata: {
        dexNumber?: string;
        source: string;
        page?: string;
        imageUrl?: string;
    };
    extras?: { // For anything extra that doesn't go anywhere else. Currently just for Oricorio's Forme Change.
        name: string;
        value: string;
    }[];
}
