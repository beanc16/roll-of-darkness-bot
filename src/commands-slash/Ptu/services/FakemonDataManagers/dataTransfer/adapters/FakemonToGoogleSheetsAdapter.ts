/* eslint-disable class-methods-use-this */

import { Adapter } from '../../../../../../services/DataTransfer/Adapter.js';
import { PtuFakemonCollection } from '../../../../dal/models/PtuFakemonCollection.js';
import { FakemonCapabilityManagerService } from '../../FakemonCapabilityManagerService.js';
import { FakemonSkillManagerService } from '../../FakemonSkillManagerService.js';
import { FakemonGoogleSheetsData } from './types.js';

export class FakemonToGoogleSheetsAdapter extends Adapter<PtuFakemonCollection, FakemonGoogleSheetsData>
{
    /** When there's no value, barring edge cases, we want to fill it with a hyphen */
    private readonly NO_VALUE = '-';
    private readonly DEFAULT_DICE = '2';
    private readonly DEFAULT_EDUCATION_DICE = '2';
    private readonly DEFAULT_MODIFIER = 0;

    public transform(input: PtuFakemonCollection): FakemonGoogleSheetsData
    {
        return {
            pokemonData: this.transformPokemonData(input),
            pokemonSkills: this.transformPokemonSkills(input),
        };
    }

    private transformPokemonData(
        input: Pick<
            PtuFakemonCollection,
            'name'
            | 'baseStats'
            | 'breedingInformation'
            | 'capabilities'
            | 'sizeInformation'
            | 'types'
        >,
    ): FakemonGoogleSheetsData['pokemonData']
    {
        const {
            name,
            baseStats,
            breedingInformation: { eggGroups },
            capabilities,
            sizeInformation,
            types,
        } = input;

        const naturewalkValues = FakemonCapabilityManagerService.findNaturewalkValues(input);
        const nonNaturewalkCapabilities = FakemonCapabilityManagerService.findNonNaturewalkCapabilities(input);

        return [
            name,
            // Stats
            baseStats.hp.toString(),
            baseStats.attack.toString(),
            baseStats.defense.toString(),
            baseStats.specialAttack.toString(),
            baseStats.specialDefense.toString(),
            baseStats.speed.toString(),
            // Type 1 & 2 label (blank fill)
            '',
            '',
            // Movement capabilities
            capabilities.overland.toString(),
            capabilities.sky?.toString() ?? '',
            capabilities.swim?.toString() ?? '',
            capabilities.levitate?.toString() ?? '',
            capabilities.burrow?.toString() ?? '',
            capabilities.highJump.toString(),
            capabilities.lowJump.toString(),
            capabilities.power.toString(),
            // Naturewalk
            naturewalkValues.length > 0 ? naturewalkValues.join(', ') : this.NO_VALUE,
            // 1-9 non-naturewalk other capabilities
            nonNaturewalkCapabilities[0] ?? this.NO_VALUE,
            nonNaturewalkCapabilities[1] ?? this.NO_VALUE,
            nonNaturewalkCapabilities[2] ?? this.NO_VALUE,
            nonNaturewalkCapabilities[3] ?? this.NO_VALUE,
            nonNaturewalkCapabilities[4] ?? this.NO_VALUE,
            nonNaturewalkCapabilities[5] ?? this.NO_VALUE,
            nonNaturewalkCapabilities[6] ?? this.NO_VALUE,
            nonNaturewalkCapabilities[7] ?? this.NO_VALUE,
            nonNaturewalkCapabilities[8] ?? this.NO_VALUE,
            // Size & Weight
            sizeInformation.height.ptu.toString(),
            sizeInformation.weight.ptu.toString(),
            // Egg Groups
            eggGroups[0] ?? this.NO_VALUE,
            eggGroups[1] ?? this.NO_VALUE,
            // Types (say 'None' if there are no types instead of providing a hyphen)
            types[0] ?? 'None',
            types[1] ?? 'None',
        ].map((value) => value.trim());
    }

    private transformPokemonSkills({ name, skills }: Pick<PtuFakemonCollection, 'name' | 'skills'>): FakemonGoogleSheetsData['pokemonSkills']
    {
        const acrobatics = FakemonSkillManagerService.deconstructSkillString(skills.acrobatics);
        const athletics = FakemonSkillManagerService.deconstructSkillString(skills.athletics);
        const combat = FakemonSkillManagerService.deconstructSkillString(skills.combat);
        const focus = FakemonSkillManagerService.deconstructSkillString(skills.focus);
        const perception = FakemonSkillManagerService.deconstructSkillString(skills.perception);
        const stealth = FakemonSkillManagerService.deconstructSkillString(skills.stealth);

        return [
            name,
            // Acrobatics
            acrobatics.skillDice.toString(),
            FakemonSkillManagerService.addSignToSkillModifier(acrobatics.skillModifier),
            // Athletics
            athletics.skillDice.toString(),
            FakemonSkillManagerService.addSignToSkillModifier(athletics.skillModifier),
            // Charm
            this.DEFAULT_DICE,
            FakemonSkillManagerService.addSignToSkillModifier(this.DEFAULT_MODIFIER),
            // Combat
            combat.skillDice.toString(),
            FakemonSkillManagerService.addSignToSkillModifier(combat.skillModifier),
            // Command
            this.DEFAULT_DICE,
            FakemonSkillManagerService.addSignToSkillModifier(this.DEFAULT_MODIFIER),
            // General Education
            this.DEFAULT_EDUCATION_DICE,
            FakemonSkillManagerService.addSignToSkillModifier(this.DEFAULT_MODIFIER),
            // Medical Education
            this.DEFAULT_EDUCATION_DICE,
            FakemonSkillManagerService.addSignToSkillModifier(this.DEFAULT_MODIFIER),
            // Occult Education
            this.DEFAULT_EDUCATION_DICE,
            FakemonSkillManagerService.addSignToSkillModifier(this.DEFAULT_MODIFIER),
            // Pokemon Education
            this.DEFAULT_EDUCATION_DICE,
            FakemonSkillManagerService.addSignToSkillModifier(this.DEFAULT_MODIFIER),
            // Technology Education
            this.DEFAULT_EDUCATION_DICE,
            FakemonSkillManagerService.addSignToSkillModifier(this.DEFAULT_MODIFIER),
            // Focus
            focus.skillDice.toString(),
            FakemonSkillManagerService.addSignToSkillModifier(focus.skillModifier),
            // Guile
            this.DEFAULT_DICE,
            FakemonSkillManagerService.addSignToSkillModifier(this.DEFAULT_MODIFIER),
            // Intimidate
            this.DEFAULT_DICE,
            FakemonSkillManagerService.addSignToSkillModifier(this.DEFAULT_MODIFIER),
            // Intuition
            this.DEFAULT_DICE,
            FakemonSkillManagerService.addSignToSkillModifier(this.DEFAULT_MODIFIER),
            // Perception
            perception.skillDice.toString(),
            FakemonSkillManagerService.addSignToSkillModifier(perception.skillModifier),
            // Stealth
            stealth.skillDice.toString(),
            FakemonSkillManagerService.addSignToSkillModifier(stealth.skillModifier),
            // Survival
            this.DEFAULT_DICE,
            FakemonSkillManagerService.addSignToSkillModifier(this.DEFAULT_MODIFIER),
        ];
    }
}
