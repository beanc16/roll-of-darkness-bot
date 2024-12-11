import { LookupConditionStrategy } from './LookupConditionStrategy.js';
import { LookupContractStrategy } from './LookupContractStrategy.js';
import { LookupMeritStrategy } from './LookupMeritStrategy.js';
import { LookupNeedleStrategy } from './LookupNeedleStrategy.js';
import { LookupThreadStrategy } from './LookupThreadStrategy.js';
import { LookupTokenStrategy } from './LookupTokenStrategy.js';

export default {
    [LookupConditionStrategy.key]: LookupConditionStrategy,
    [LookupContractStrategy.key]: LookupContractStrategy,
    [LookupMeritStrategy.key]: LookupMeritStrategy,
    [LookupNeedleStrategy.key]: LookupNeedleStrategy,
    [LookupThreadStrategy.key]: LookupThreadStrategy,
    [LookupTokenStrategy.key]: LookupTokenStrategy,
};
