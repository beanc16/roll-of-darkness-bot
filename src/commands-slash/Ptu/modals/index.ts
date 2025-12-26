import { BreedPokemonUpdateAbilityModal } from './breed/BreedPokemonUpdateAbilityModal.js';
import { BreedPokemonUpdateGenderModal } from './breed/BreedPokemonUpdateGenderModal.js';
import { BreedPokemonUpdateInheritanceMovesModal } from './breed/BreedPokemonUpdateInheritanceMovesModal.js';
import { BreedPokemonUpdateNatureModal } from './breed/BreedPokemonUpdateNatureModal.js';
import { FakemonStatEditingModal } from './fakemon/FakemonStatEditingModal.js';
import { GenerateSkillBackgroundModal } from './generate/GenerateSkillBackgroundModal.js';

export const ptuModals = [
    // Breed
    BreedPokemonUpdateAbilityModal,
    BreedPokemonUpdateInheritanceMovesModal,
    BreedPokemonUpdateGenderModal,
    BreedPokemonUpdateNatureModal,

    // Fakemon
    FakemonStatEditingModal,

    // Generate
    GenerateSkillBackgroundModal,
];
