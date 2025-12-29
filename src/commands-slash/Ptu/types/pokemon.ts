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

export enum FullPokemonStat
{
    Hp = 'Health',
    Attack = 'Attack',
    Defense = 'Defense',
    SpecialAttack = 'Special Attack',
    SpecialDefense = 'Special Defense',
    Speed = 'Speed',
}

export enum PokemonEggGroup
{
    Amorphous = 'Amorphous',
    Bug = 'Bug',
    Ditto = 'Ditto',
    Dragon = 'Dragon',
    Fairy = 'Fairy',
    FieldOrGround = 'Field / Ground',
    Flying = 'Flying',
    GrassOrPlant = 'Grass / Plant',
    Humanshape = 'Humanshape',
    Indeterminate = 'Indeterminate',
    Mineral = 'Mineral',
    Monster = 'Monster',
    None = 'None',
    Water1 = 'Water 1',
    Water2 = 'Water 2',
    Water3 = 'Water 3',
}

export enum PokemonDiet
{
    Candyvore = 'Candyvore',
    Carnivore = 'Carnivore',
    DietCanChangeWithForm = 'Diet can change with its form',
    Ergovore = 'Ergovore',
    FilterFeeder = 'Filter Feeder',
    Herbivore = 'Herbivore',
    Illumivore = 'Illumivore',
    Insectivore = 'Insectivore',
    Nullivore = 'Nullivore',
    Omnivore = 'Omnivore',
    Phototroph = 'Phototroph',
    Terravore = 'Terravore',
}

export enum PokemonHabitat
{
    Arctic = 'Arctic',
    Beach = 'Beach',
    Cave = 'Cave',
    Desert = 'Desert',
    Forest = 'Forest',
    Freshwater = 'Freshwater',
    Grasslands = 'Grasslands',
    Marsh = 'Marsh',
    Mountain = 'Mountain',
    NonSpace = 'Non-Space',
    Oceans = 'Oceans',
    Plains = 'Plains',
    Rainforest = 'Rainforest',
    River = 'River',
    Ruins = 'Ruins',
    Space = 'Space',
    Taiga = 'Taiga',
    Tundra = 'Tundra',
    UltraSpace = 'Ultra Space',
    Underground = 'Underground',
    Urban = 'Urban',
    Wetlands = 'Wetlands',
    Unknown = '???',
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

export enum PtuContestStatType
{
    Beauty = 'Beauty',
    Cool = 'Cool',
    Cute = 'Cute',
    Smart = 'Smart',
    Tough = 'Tough',
}

export enum PtuContestStatEffect
{
    AttentionGrabber = 'Attention Grabber',
    BigShow = 'Big Show',
    CatchingUp = 'Catching Up',
    Desperation = 'Desperation',
    DoubleTime = 'Double Time',
    Excitement = 'Excitement',
    ExhaustingAct = 'Exhausting Act',
    Gamble = 'Gamble',
    GetReady = 'Get Ready!',
    GoodShow = 'Good Show!',
    Incentives = 'Incentives',
    InversedAppeal = 'Inversed Appeal',
    ReflectiveAppeal = 'Reflective Appeal',
    Reliable = 'Reliable',
    Sabotage = 'Sabotage',
    SafeOption = 'Safe Option',
    SavingGrace = 'Saving Grace',
    SeenNothingYet = 'Seen Nothing Yet',
    SpecialAttention = 'Special Attention',
    SteadyPerformance = 'Steady Performance',
    Tease = 'Tease',
    Unsettling = 'Unsettling',
}

export enum PokemonStatusType
{
    Persistent = 'Persistent',
    Volatile = 'Volatile',
    Other = 'Other',
}

export enum PtuHeight
{
    Small = 'Small',
    Medium = 'Medium',
    Large = 'Large',
    Huge = 'Huge',
    Gigantic = 'Gigantic',
}

// For pokemon data from google sheets
export interface PtuPokemonMinimalData
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
    capabilities: {
        overland: number;
        swim?: number;
        sky?: number;
        levitate?: number;
        burrow?: number;
        highJump: number;
        lowJump: number;
        power: number;
        other?: string[];
    };
    sizeInformation: {
        height: {
            ptu: string;
        };
        weight: {
            ptu: number;
        };
    };
    breedingInformation: {
        eggGroups: string[];
    };
}

// TODO: Move this to a types package owned by an API that controls this data with PtuController later
export interface PtuPokemon extends PtuPokemonMinimalData
{
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
    sizeInformation: (PtuPokemonMinimalData['sizeInformation'] & {
        height: (PtuPokemonMinimalData['sizeInformation']['height'] & {
            freedom: string;
            metric: string;
        });
        weight: (PtuPokemonMinimalData['sizeInformation']['weight'] & {
            freedom: string;
            metric: string;
        });
    });
    breedingInformation: (PtuPokemonMinimalData['breedingInformation'] & {
        genderRatio: {
            male?: number;
            female?: number;
            none?: boolean;
        };
        averageHatchRate?: string;
    });
    diets: string[];
    habitats: string[];
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
    versionName: string;
    olderVersions?: (Omit<PtuPokemon, 'name' | 'olderVersions'> & {
        versionName: string;
    })[];
}
