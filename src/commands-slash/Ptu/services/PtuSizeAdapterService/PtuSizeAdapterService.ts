import { convert } from 'convert';

import { PtuHeight, type PtuPokemon } from '../../types/pokemon.js';

export class PtuSizeAdapterService
{
    public static adaptWeight(lbs: number, abilities: PtuPokemon['abilities']): PtuPokemon['sizeInformation']['weight']
    {
        const parsedLbs = parseFloat(lbs.toString());

        if (Number.isNaN(parsedLbs))
        {
            throw new Error(`Invalid weight value: ${lbs}`);
        }

        const kgsConverted = this.convert({
            value: parsedLbs,
            from: 'lb',
            to: 'kg',
            decimals: 1,
        });

        return this.formatWeight(parsedLbs, kgsConverted, abilities);
    }

    private static formatWeight(
        lbs: number,
        kgs: number,
        abilities: PtuPokemon['abilities'],
    ): PtuPokemon['sizeInformation']['weight']
    {
        return {
            freedom: `${lbs}lbs`,
            metric: `${kgs}kg`,
            ptu: this.getPtuWeightClass(lbs, abilities),
        };
    }

    private static getPtuWeightClass(
        lbs: number,
        abilities: PtuPokemon['abilities'],
    ): PtuPokemon['sizeInformation']['weight']['ptu']
    {
        if (lbs >= 0 && lbs <= 25)
        {
            return 1;
        }

        if (lbs > 25 && lbs <= 55)
        {
            return 2;
        }

        if (lbs > 55 && lbs <= 110)
        {
            return 3;
        }

        if (lbs > 110 && lbs <= 220)
        {
            return 4;
        }

        if (lbs > 220 && lbs <= 440)
        {
            return 5;
        }

        const hasHeavyMetalAbility = Object.values(abilities).some((ability) =>
        {
            if (Array.isArray(ability))
            {
                return ability.some((a) => a.trim().toUpperCase() === 'HEAVY METAL');
            }

            return ability.trim().toUpperCase() === 'HEAVY METAL';
        });

        if (hasHeavyMetalAbility && lbs >= 450)
        {
            return 7;
        }

        if (lbs > 440)
        {
            return 6;
        }

        throw new Error(`Invalid weight: ${lbs}lb`);
    }

    public static adaptHeight(ft: number, inches: number): PtuPokemon['sizeInformation']['height']
    {
        if (!(Number.isSafeInteger(ft) && Number.isSafeInteger(inches)))
        {
            throw new Error(`Feet and inches must be provided as integers: ${ft}ft ${inches}in`);
        }

        const heightInInches = this.feetAndInchesToInches(ft, inches);
        const metersConverted = this.convert({
            value: heightInInches,
            from: 'in',
            to: 'm',
            decimals: 1,
        });

        // Overflow in case more than 12 inches were given
        const overflow = this.overflowInchesIntoFeet(ft, inches);

        // Format
        return this.formatHeight(overflow.ft, overflow.inches, heightInInches, metersConverted);
    }

    private static formatHeight(
        ft: number,
        inches: number,
        heightInInches: number,
        meters: number,
    ): PtuPokemon['sizeInformation']['height']
    {
        return {
            freedom: `${ft}'${inches}"`,
            metric: `${meters}m`,
            ptu: this.getPtuHeightClass(
                ft,
                inches,
                heightInInches,
            ),
        };
    }

    private static getPtuHeightClass(
        ft: number,
        inches: number,
        heightInInches: number,
    ): PtuPokemon['sizeInformation']['height']['ptu']
    {
        if (
            heightInInches >= 0
            && heightInInches <= this.feetAndInchesToInches(3, 2)
        )
        {
            return PtuHeight.Small;
        }

        if (
            heightInInches > this.feetAndInchesToInches(3, 2)
            && heightInInches <= this.feetAndInchesToInches(5, 11)
        )
        {
            return PtuHeight.Medium;
        }

        if (
            heightInInches > this.feetAndInchesToInches(5, 11)
            && heightInInches <= this.feetAndInchesToInches(8, 11)
        )
        {
            return PtuHeight.Large;
        }

        if (
            heightInInches > this.feetAndInchesToInches(8, 11)
            && heightInInches <= this.feetAndInchesToInches(13, 11)
        )
        {
            return PtuHeight.Huge;
        }

        if (heightInInches > this.feetAndInchesToInches(13, 11))
        {
            return PtuHeight.Gigantic;
        }

        throw new Error(`Invalid height: ${ft}'${inches}" (${heightInInches} inches)`);
    }

    private static feetAndInchesToInches(ft: number, inches: number): number
    {
        const ftAsInches = this.convert({
            value: ft,
            from: 'feet',
            to: 'in',
        });

        return ftAsInches + inches;
    }

    private static overflowInchesIntoFeet(ft: number, inches: number): { ft: number; inches: number }
    {
        const inchesAsFeetWithDecimal = this.convert({
            value: inches,
            from: 'in',
            to: 'feet',
            decimals: 1,
        });
        const inchesAsFeet = Math.floor(inchesAsFeetWithDecimal);
        const inchesToRemove = this.convert({
            value: inchesAsFeet,
            from: 'feet',
            to: 'in',
        });

        return {
            ft: ft + inchesAsFeet,
            inches: inches - inchesToRemove,
        };
    }

    private static convert({
        value,
        from,
        to,
        decimals = 0,
    }: {
        value: number;
        from: Parameters<typeof convert>[1];
        to: Parameters<typeof convert>[1];
        decimals?: number;
    }): number
    {
        const convertedValue = convert(value, from).to(to);

        if (decimals < 0)
        {
            throw new Error(`Decimals must be a positive number: ${decimals}`);
        }

        if (decimals === 0)
        {
            return Math.round(convertedValue);
        }

        return parseFloat(convertedValue.toFixed(decimals));
    }
}
