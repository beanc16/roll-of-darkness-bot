import { LookupConditionStrategy } from './LookupConditionStrategy.js';
import { LookupContractStrategy } from './LookupContractStrategy.js';
import { LookupMeritStrategy } from './LookupMeritStrategy.js';
import { LookupNeedleStrategy } from './LookupNeedleStrategy.js';

export default {
    [LookupConditionStrategy.key]: LookupConditionStrategy,
    [LookupContractStrategy.key]: LookupContractStrategy,
    [LookupMeritStrategy.key]: LookupMeritStrategy,
    [LookupNeedleStrategy.key]: LookupNeedleStrategy,
};
