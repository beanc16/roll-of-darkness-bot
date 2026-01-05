/* eslint-disable class-methods-use-this */

import { logger } from '@beanc16/logger';

import { CachedGoogleSheetsApiService } from '../../../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { DataTransferDestination } from '../../../../../../services/DataTransfer/DataTransferDestination.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../../../constants.js';
import { PtuFakemonCollection } from '../../../../dal/models/PtuFakemonCollection.js';
import {
    PokemonEggGroup,
    PokemonType,
    PtuHeight,
} from '../../../../types/pokemon.js';
import { FakemonGeneralInformationManagerService } from '../../FakemonGeneralInformationManagerService.js';
import { FakemonGoogleSheetsData } from '../adapters/types.js';

export class FakemonGoogleSheetsDestination extends DataTransferDestination<FakemonGoogleSheetsData, PtuFakemonCollection>
{
    private readonly validTypes = new Set([...Object.values(PokemonType), 'None']);
    private readonly validEggGroups = new Set([...Object.values(PokemonEggGroup), '-']);
    private readonly validSizes = new Set(Object.values(PtuHeight));
    private readonly validWeight = new Set([1, 2, 3, 4, 5, 6, 7]);

    public async create(input: FakemonGoogleSheetsData, source: PtuFakemonCollection): Promise<void>
    {
        // Do not continue if the fakemon has already been transferred
        if (await this.wasTransferred(input, source))
        {
            return;
        }

        const transferredToGoogleSheets = {
            pokemonData: false,
            pokemonSkills: false,
        };

        // Append pokemon data
        try
        {
            const { errorType } = await CachedGoogleSheetsApiService.append({
                spreadsheetId: rollOfDarknessPtuSpreadsheetId,
                range: 'Pokemon Data',
                values: [input.pokemonData],
                shouldNotCache: true,
            });

            if (!errorType)
            {
                transferredToGoogleSheets.pokemonData = true;
            }
        }
        catch (error)
        {
            logger.error('Failed to transfer pokemon data to Google Sheets', error);
        }

        // Append pokemon skills
        try
        {
            const { errorType } = await CachedGoogleSheetsApiService.append({
                spreadsheetId: rollOfDarknessPtuSpreadsheetId,
                range: 'Pokemon Skills',
                values: [input.pokemonSkills],
                shouldNotCache: true,
            });

            if (!errorType)
            {
                transferredToGoogleSheets.pokemonSkills = true;
            }
        }
        catch (error)
        {
            logger.error('Failed to transfer pokemon skills to Google Sheets', error);
        }

        // Say that the fakemon has been transferred or not
        await FakemonGeneralInformationManagerService.updateTransferredTo({
            fakemon: source,
            transferredTo: {
                googleSheets: transferredToGoogleSheets,
            },
        });
    }

    protected validateInput(input: FakemonGoogleSheetsData): asserts input is FakemonGoogleSheetsData
    {
        this.validatePokemonData(input.pokemonData);
        this.validatePokemonSkills(input.pokemonSkills);
    }

    private validatePokemonData(input: FakemonGoogleSheetsData['pokemonData']): asserts input is FakemonGoogleSheetsData['pokemonData']
    {
        const [
            pokemonName,
            hp,
            attack,
            defense,
            specialAttack,
            specialDefense,
            speed,
            _type1Label, // Blank fill
            _type2Label, // Blank fill
            overland,
            sky,
            swim,
            levitate,
            burrow,
            highJump,
            lowJump,
            power,
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
            weight,
            eggGroup1,
            eggGroup2,
            type1,
            type2,
        ] = input;

        // Name
        if (pokemonName.length === 0)
        {
            throw new Error('Pokemon name cannot be empty');
        }

        // Stats
        const hpInt = parseInt(hp, 10);
        const attackInt = parseInt(attack, 10);
        const defenseInt = parseInt(defense, 10);
        const specialAttackInt = parseInt(specialAttack, 10);
        const specialDefenseInt = parseInt(specialDefense, 10);
        const speedInt = parseInt(speed, 10);
        if (hp.length === 0)
        {
            throw new Error('HP cannot be empty');
        }
        if (attack.length === 0)
        {
            throw new Error('Attack cannot be empty');
        }
        if (defense.length === 0)
        {
            throw new Error('Defense cannot be empty');
        }
        if (specialAttack.length === 0)
        {
            throw new Error('Special attack cannot be empty');
        }
        if (specialDefense.length === 0)
        {
            throw new Error('Special defense cannot be empty');
        }
        if (speed.length === 0)
        {
            throw new Error('Speed cannot be empty');
        }
        if (Number.isNaN(hpInt))
        {
            throw new Error(`HP is not a number: ${hp}`);
        }
        if (Number.isNaN(attackInt))
        {
            throw new Error(`Attack is not a number: ${attack}`);
        }
        if (Number.isNaN(defenseInt))
        {
            throw new Error(`Defense is not a number: ${defense}`);
        }
        if (Number.isNaN(specialAttackInt))
        {
            throw new Error(`Special attack is not a number: ${specialAttack}`);
        }
        if (Number.isNaN(specialDefenseInt))
        {
            throw new Error(`Special defense is not a number: ${specialDefense}`);
        }
        if (Number.isNaN(speedInt))
        {
            throw new Error(`Speed is not a number: ${speed}`);
        }
        if (hpInt < 0)
        {
            throw new Error(`HP cannot be negative: ${hp}`);
        }
        if (attackInt < 0)
        {
            throw new Error(`Attack cannot be negative: ${attack}`);
        }
        if (defenseInt < 0)
        {
            throw new Error(`Defense cannot be negative: ${defense}`);
        }
        if (specialAttackInt < 0)
        {
            throw new Error(`Special attack cannot be negative: ${specialAttack}`);
        }
        if (specialDefenseInt < 0)
        {
            throw new Error(`Special defense cannot be negative: ${specialDefense}`);
        }
        if (speedInt < 0)
        {
            throw new Error(`Speed cannot be negative: ${speed}`);
        }

        // Capabilities
        const overlandInt = parseInt(overland, 10);
        const swimInt = parseInt(swim, 10);
        const skyInt = parseInt(sky, 10);
        const levitateInt = parseInt(levitate, 10);
        const burrowInt = parseInt(burrow, 10);
        const highJumpInt = parseInt(highJump, 10);
        const lowJumpInt = parseInt(lowJump, 10);
        const powerInt = parseInt(power, 10);
        const isSwimValid = swim === undefined || !Number.isNaN(swimInt);
        const isSkyValid = sky === undefined || !Number.isNaN(skyInt);
        const isLevitateValid = levitate === undefined || !Number.isNaN(levitateInt);
        const isBurrowValid = burrow === undefined || !Number.isNaN(burrowInt);
        if (overland.length === 0)
        {
            throw new Error('Overland cannot be empty');
        }
        if (Number.isNaN(overlandInt))
        {
            throw new Error(`Overland is not a number: ${overland}`);
        }
        if (overlandInt < 0)
        {
            throw new Error(`Overland cannot be negative: ${overland}`);
        }
        if (!isSwimValid)
        {
            throw new Error(`Swim is not a number: ${swim}`);
        }
        if (swimInt < 0)
        {
            throw new Error(`Swim cannot be negative: ${swim}`);
        }
        if (!isSkyValid)
        {
            throw new Error(`Sky is not a number: ${sky}`);
        }
        if (skyInt < 0)
        {
            throw new Error(`Sky cannot be negative: ${sky}`);
        }
        if (!isLevitateValid)
        {
            throw new Error(`Levitate is not a number: ${levitate}`);
        }
        if (levitateInt < 0)
        {
            throw new Error(`Levitate cannot be negative: ${levitate}`);
        }
        if (!isBurrowValid)
        {
            throw new Error(`Burrow is not a number: ${burrow}`);
        }
        if (burrowInt < 0)
        {
            throw new Error(`Burrow cannot be negative: ${burrow}`);
        }
        if (Number.isNaN(highJumpInt))
        {
            throw new Error(`High jump is not a number: ${highJump}`);
        }
        if (highJumpInt < 0)
        {
            throw new Error(`High jump cannot be negative: ${highJump}`);
        }
        if (Number.isNaN(lowJumpInt))
        {
            throw new Error(`Low jump is not a number: ${lowJump}`);
        }
        if (lowJumpInt < 0)
        {
            throw new Error(`Low jump cannot be negative: ${lowJump}`);
        }
        if (Number.isNaN(powerInt))
        {
            throw new Error(`Power is not a number: ${power}`);
        }
        if (powerInt < 0)
        {
            throw new Error(`Power cannot be negative: ${power}`);
        }

        if (naturewalk.length === 0)
        {
            throw new Error('Naturewalk cannot be empty');
        }
        if (capability1.length === 0)
        {
            throw new Error('Capability 1 cannot be empty');
        }
        if (capability2.length === 0)
        {
            throw new Error('Capability 2 cannot be empty');
        }
        if (capability3.length === 0)
        {
            throw new Error('Capability 3 cannot be empty');
        }
        if (capability4.length === 0)
        {
            throw new Error('Capability 4 cannot be empty');
        }
        if (capability5.length === 0)
        {
            throw new Error('Capability 5 cannot be empty');
        }
        if (capability6.length === 0)
        {
            throw new Error('Capability 6 cannot be empty');
        }
        if (capability7.length === 0)
        {
            throw new Error('Capability 7 cannot be empty');
        }
        if (capability8.length === 0)
        {
            throw new Error('Capability 8 cannot be empty');
        }
        if (capability9.length === 0)
        {
            throw new Error('Capability 9 cannot be empty');
        }

        // Size & Weight
        const weightInt = parseInt(weight, 10);
        if (size.length === 0)
        {
            throw new Error('Size cannot be empty');
        }
        if (weight.length === 0)
        {
            throw new Error('Weight cannot be empty');
        }
        if (!this.validSizes.has(size as PtuHeight))
        {
            throw new Error(`Size is not valid: ${size}`);
        }
        if (Number.isNaN(weightInt) || !this.validWeight.has(weightInt))
        {
            throw new Error(`Weight is not valid: ${weight}`);
        }

        // Egg Groups
        if (!this.validEggGroups.has(eggGroup1))
        {
            throw new Error(`Egg group 1 is not valid: ${eggGroup1}`);
        }
        if (!this.validEggGroups.has(eggGroup2))
        {
            throw new Error(`Egg group 2 is not valid: ${eggGroup2}`);
        }

        // Types
        if (!this.validTypes.has(type1))
        {
            throw new Error(`Type 1 is not valid: ${type1}`);
        }
        if (!this.validTypes.has(type2))
        {
            throw new Error(`Type 2 is not valid: ${type2}`);
        }
    }

    private validatePokemonSkills(input: FakemonGoogleSheetsData['pokemonSkills']): asserts input is FakemonGoogleSheetsData['pokemonSkills']
    {
        const [
            acrobaticsSkillDice,
            acrobaticSkillModifier,
            atheleticsSkillDice,
            atheleticSkillModifier,
            charmSkillDice,
            charmSkillModifier,
            combatSkillDice,
            combatSkillModifier,
            commandSkillDice,
            commandSkillModifier,
            generalEducationSkillDice,
            generalEducationSkillModifier,
            medicalEducationSkillDice,
            medicalEducationSkillModifier,
            occultEducationSkillDice,
            occultEducationSkillModifier,
            pokemonEducationSkillDice,
            pokemonEducationSkillModifier,
            technologyEducationSkillDice,
            technologyEducationSkillModifier,
            focusSkillDice,
            focusSkillModifier,
            guileSkillDice,
            guileSkillModifier,
            intimidateSkillDice,
            intimidateSkillModifier,
            intuitionSkillDice,
            intuitionSkillModifier,
            perceptionSkillDice,
            perceptionSkillModifier,
            stealthSkillDice,
            stealthSkillModifier,
            survivalSkillDice,
            survivalSkillModifier,
        ] = input;

        const allSkillDice = [
            acrobaticsSkillDice,
            atheleticsSkillDice,
            charmSkillDice,
            combatSkillDice,
            commandSkillDice,
            generalEducationSkillDice,
            medicalEducationSkillDice,
            occultEducationSkillDice,
            pokemonEducationSkillDice,
            technologyEducationSkillDice,
            focusSkillDice,
            guileSkillDice,
            intimidateSkillDice,
            intuitionSkillDice,
            perceptionSkillDice,
            stealthSkillDice,
            survivalSkillDice,
        ];

        const allSkillModifiers = [
            acrobaticSkillModifier,
            atheleticSkillModifier,
            charmSkillModifier,
            combatSkillModifier,
            commandSkillModifier,
            generalEducationSkillModifier,
            medicalEducationSkillModifier,
            occultEducationSkillModifier,
            pokemonEducationSkillModifier,
            technologyEducationSkillModifier,
            focusSkillModifier,
            guileSkillModifier,
            intimidateSkillModifier,
            intuitionSkillModifier,
            perceptionSkillModifier,
            stealthSkillModifier,
            survivalSkillModifier,
        ];

        allSkillDice.forEach((skillDice) =>
        {
            if (!this.isValidSkillDice(skillDice))
            {
                throw new Error(`Invalid skill dice: ${skillDice}`);
            }
        });

        allSkillModifiers.forEach((skillModifier) =>
        {
            if (!this.isValidSkillModifier(skillModifier))
            {
                throw new Error(`Invalid skill modifier: ${skillModifier}`);
            }
        });
    }

    private isValidSkillDice(skillDice: string): boolean
    {
        const regex = /^[1-6]$/;
        return regex.test(skillDice);
    }

    private isValidSkillModifier(skillModifier: string): boolean
    {
        const regex = /^[+-](?:[1-6]|0)$/;
        return regex.test(skillModifier);
    }

    public async wasTransferred(input: FakemonGoogleSheetsData, source: PtuFakemonCollection): Promise<boolean>
    {
        const { data = [], errorType } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessPtuSpreadsheetId,
            range: 'Pokemon Data',
            shouldNotCache: true,
        });

        if (errorType)
        {
            logger.warn('Failed to get pokemon data from Google Sheets', errorType);
            return false;
        }

        let foundNameInPokemonData = false;

        // Loop through the pokemon data backwards (more efficient since we
        // append to the bottom) & check if the name is in the pokemon data
        for (let i = data.length - 1; i >= 0; i -= 1)
        {
            const [curPokemonName] = data[i];
            if (curPokemonName === input.pokemonData[0])
            {
                foundNameInPokemonData = true;
                break;
            }
        }

        return (
            foundNameInPokemonData
            && source.transferredTo.googleSheets.pokemonData
            && source.transferredTo.googleSheets.pokemonSkills
        );
    }
}
