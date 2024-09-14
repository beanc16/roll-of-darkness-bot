import { LookupAbilityStrategy } from './LookupAbilityStrategy.js';
import { LookupMoveStrategy } from './LookupMoveStrategy.js';
import { LookupTmStrategy } from './LookupTmStrategy.js';

export default {
    [LookupAbilityStrategy.key]: LookupAbilityStrategy,
    [LookupMoveStrategy.key]: LookupMoveStrategy,
    [LookupTmStrategy.key]: LookupTmStrategy,
};
