import { BreedPokemonUpdateAbilityModal } from './breed/BreedPokemonUpdateAbilityModal.js';
import { BreedPokemonUpdateGenderModal } from './breed/BreedPokemonUpdateGenderModal.js';
import { BreedPokemonUpdateInheritanceMovesModal } from './breed/BreedPokemonUpdateInheritanceMovesModal.js';
import { BreedPokemonUpdateNatureModal } from './breed/BreedPokemonUpdateNatureModal.js';
import { FakemonAbilityEditingModal1 } from './fakemon/abilities/FakemonAbilityEditingModal1.js';
import { FakemonAbilityEditingModal2 } from './fakemon/abilities/FakemonAbilityEditingModal2.js';
import { FakemonStatEditingModal } from './fakemon/FakemonStatEditingModal.js';
import { GenerateSkillBackgroundModal } from './generate/GenerateSkillBackgroundModal.js';

export const ptuModals = [
    // Breed
    BreedPokemonUpdateAbilityModal,
    BreedPokemonUpdateInheritanceMovesModal,
    BreedPokemonUpdateGenderModal,
    BreedPokemonUpdateNatureModal,

    // Fakemon
    FakemonAbilityEditingModal1,
    FakemonAbilityEditingModal2,
    FakemonStatEditingModal,

    // Generate
    GenerateSkillBackgroundModal,
];
