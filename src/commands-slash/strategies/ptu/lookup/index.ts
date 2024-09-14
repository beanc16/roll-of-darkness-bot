import { LookupAbilityStrategy } from './LookupAbilityStrategy.js';
import { LookupMoveStrategy } from './LookupMoveStrategy.js';
import { LookupNatureStrategy } from './LookupNatureStrategy.js';
import { LookupTmStrategy } from './LookupTmStrategy.js';

export default {
    [LookupAbilityStrategy.key]: LookupAbilityStrategy,
    [LookupMoveStrategy.key]: LookupMoveStrategy,
    [LookupNatureStrategy.key]: LookupNatureStrategy,
    [LookupTmStrategy.key]: LookupTmStrategy,
};
