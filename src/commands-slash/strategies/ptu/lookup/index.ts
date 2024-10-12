import { LookupAbilityStrategy } from './LookupAbilityStrategy.js';
import { LookupCapabilityStrategy } from './LookupCapabilityStrategy.js';
import { LookupMoveStrategy } from './LookupMoveStrategy.js';
import { LookupNatureStrategy } from './LookupNatureStrategy.js';
import { LookupPokemonStrategy } from './LookupPokemonStrategy.js';
import { LookupStatusStrategy } from './LookupStatusStrategy.js';
import { LookupTmStrategy } from './LookupTmStrategy.js';

export default {
    [LookupAbilityStrategy.key]: LookupAbilityStrategy,
    [LookupCapabilityStrategy.key]: LookupCapabilityStrategy,
    [LookupMoveStrategy.key]: LookupMoveStrategy,
    [LookupNatureStrategy.key]: LookupNatureStrategy,
    [LookupPokemonStrategy.key]: LookupPokemonStrategy,
    [LookupStatusStrategy.key]: LookupStatusStrategy,
    [LookupTmStrategy.key]: LookupTmStrategy,
};
