import { LookupConditionStrategy } from './LookupConditionStrategy.js';
import { LookupContractStrategy } from './LookupContractStrategy.js';
import { LookupGoblinFruitStrategy } from './LookupGoblinFruitStrategy.js';
import { LookupMeritStrategy } from './LookupMeritStrategy.js';
import { LookupNeedleStrategy } from './LookupNeedleStrategy.js';
import { LookupThreadStrategy } from './LookupThreadStrategy.js';
import { LookupTiltStrategy } from './LookupTiltStrategy.js';
import { LookupTokenStrategy } from './LookupTokenStrategy.js';
import { LookupWeaponStrategy } from './LookupWeaponStrategy.js';

export default {
    [LookupConditionStrategy.key]: LookupConditionStrategy,
    [LookupContractStrategy.key]: LookupContractStrategy,
    [LookupGoblinFruitStrategy.key]: LookupGoblinFruitStrategy,
    [LookupMeritStrategy.key]: LookupMeritStrategy,
    [LookupNeedleStrategy.key]: LookupNeedleStrategy,
    [LookupThreadStrategy.key]: LookupThreadStrategy,
    [LookupTiltStrategy.key]: LookupTiltStrategy,
    [LookupTokenStrategy.key]: LookupTokenStrategy,
    [LookupWeaponStrategy.key]: LookupWeaponStrategy,
};
