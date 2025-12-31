import { BreedPokemonUpdateAbilityModal } from './breed/BreedPokemonUpdateAbilityModal.js';
import { BreedPokemonUpdateGenderModal } from './breed/BreedPokemonUpdateGenderModal.js';
import { BreedPokemonUpdateInheritanceMovesModal } from './breed/BreedPokemonUpdateInheritanceMovesModal.js';
import { BreedPokemonUpdateNatureModal } from './breed/BreedPokemonUpdateNatureModal.js';
import { FakemonAbilityEditingModal1 } from './fakemon/abilities/FakemonAbilityEditingModal1.js';
import { FakemonAbilityEditingModal2 } from './fakemon/abilities/FakemonAbilityEditingModal2.js';
import { FakemonNonOtherCapabilityEditingModal1 } from './fakemon/capabilities/FakemonNonOtherCapabilityEditingModal1.js';
import { FakemonNonOtherCapabilityEditingModal2 } from './fakemon/capabilities/FakemonNonOtherCapabilityEditingModal2.js';
import { FakemonOtherCapabilityAddingModal } from './fakemon/capabilities/FakemonOtherCapabilityAddingModal.js';
import { FakemonStatEditingModal } from './fakemon/FakemonStatEditingModal.js';
import { FakemonSIHeightEditingModal } from './fakemon/sizeInformation/FakemonSIHeightEditingModal.js';
import { FakemonSIWeightEditingModal } from './fakemon/sizeInformation/FakemonSIWeightEditingModal.js';
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
    FakemonNonOtherCapabilityEditingModal1,
    FakemonNonOtherCapabilityEditingModal2,
    FakemonOtherCapabilityAddingModal,
    FakemonSIHeightEditingModal,
    FakemonSIWeightEditingModal,
    FakemonStatEditingModal,

    // Generate
    GenerateSkillBackgroundModal,
];
