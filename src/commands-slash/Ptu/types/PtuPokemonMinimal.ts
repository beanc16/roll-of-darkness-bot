import { PtuPokemonMinimalData } from './pokemon.js';

export class PtuPokemonMinimal implements PtuPokemonMinimalData
{
    public name: string;
    public types: string[];
    public baseStats: {
        hp: number;
        attack: number;
        defense: number;
        specialAttack: number;
        specialDefense: number;
        speed: number;
    };

    public capabilities: {
        overland: number;
        swim: number;
        sky: number;
        levitate: number;
        burrow: number;
        highJump: number;
        lowJump: number;
        power: number;
        other: string[];
    };

    public sizeInformation: {
        height: {
            ptu: string;
        };
        weight: {
            ptu: number;
        };
    };

    public breedingInformation: {
        eggGroups: string[];
    };

    constructor(input: string[])
    {
        const [
            name,
            unparsedHp,
            unparsedAttack,
            unparsedDefense,
            unparsedSpecialAttack,
            unparsedSpecialDefense,
            unparsedSpeed,
            _1,
            _2,
            unparsedOverland,
            unparsedSky,
            unparsedSwim,
            unparsedLevitate,
            unparsedBurrow,
            unparsedHighJump,
            unparsedLowJump,
            unparsedPower,
            naturewalk,
            capability1,
            capability2,
            capability3,
            capability4,
            capability5,
            capability6,
            capability7,
            capability8,
            capability9,
            size,
            unparsedWeight,
            eggGroup1,
            eggGroup2,
            type1,
            type2 = '', // Default in case this isn't included
        ] = input;

        // Parse stat numbers
        const hp = parseInt(unparsedHp, 10);
        const attack = parseInt(unparsedAttack, 10);
        const defense = parseInt(unparsedDefense, 10);
        const specialAttack = parseInt(unparsedSpecialAttack, 10);
        const specialDefense = parseInt(unparsedSpecialDefense, 10);
        const speed = parseInt(unparsedSpeed, 10);

        // Parse capability numbers
        const overland = parseInt(unparsedOverland, 10);
        const sky = parseInt(unparsedSky, 10);
        const swim = parseInt(unparsedSwim, 10);
        const levitate = parseInt(unparsedLevitate, 10);
        const burrow = parseInt(unparsedBurrow, 10);
        const highJump = parseInt(unparsedHighJump, 10);
        const lowJump = parseInt(unparsedLowJump, 10);
        const power = parseInt(unparsedPower, 10);

        // Parse other numbers
        const weight = parseInt(unparsedWeight, 10);

        this.name = name.trim();
        this.types = [
            ...(type1.trim() && type1.trim() !== '-' && type1.trim() !== '--' && type1.trim().toLowerCase() !== 'none'
                ? [type1]
                : []
            ),
            ...(type2.trim() && type2.trim() !== '-' && type2.trim() !== '--' && type2.trim().toLowerCase() !== 'none'
                ? [type2]
                : []
            ),
        ];

        this.baseStats = {
            hp,
            attack,
            defense,
            specialAttack,
            specialDefense,
            speed,
        };

        this.capabilities = {
            overland,
            sky,
            swim,
            levitate,
            burrow,
            highJump,
            lowJump,
            power,
            other: [
                ...(naturewalk.trim() !== '' && naturewalk.trim() !== '-' ? [`Naturewalk (${naturewalk})`] : []),
                ...(capability1.trim() !== '' && capability1.trim() !== '-' ? [capability1] : []),
                ...(capability2.trim() !== '' && capability2.trim() !== '-' ? [capability2] : []),
                ...(capability3.trim() !== '' && capability3.trim() !== '-' ? [capability3] : []),
                ...(capability4.trim() !== '' && capability4.trim() !== '-' ? [capability4] : []),
                ...(capability5.trim() !== '' && capability5.trim() !== '-' ? [capability5] : []),
                ...(capability6.trim() !== '' && capability6.trim() !== '-' ? [capability6] : []),
                ...(capability7.trim() !== '' && capability7.trim() !== '-' ? [capability7] : []),
                ...(capability8.trim() !== '' && capability8.trim() !== '-' ? [capability8] : []),
                ...(capability9.trim() !== '' && capability9.trim() !== '-' ? [capability9] : []),
            ],
        };

        this.sizeInformation = {
            height: {
                ptu: size,
            },
            weight: {
                ptu: weight,
            },
        };

        this.breedingInformation = {
            eggGroups: [
                ...(eggGroup1.trim() && eggGroup1.trim() !== '-'
                    ? [eggGroup1]
                    : []
                ),
                ...(eggGroup2.trim() && eggGroup2.trim() !== '-'
                    ? [eggGroup2]
                    : []
                ),
            ],
        };
    }
}
