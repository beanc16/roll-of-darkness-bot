import { FakemonCreateStrategy } from './FakemonCreateStrategy.js';
import { FakemonDeleteStrategy } from './FakemonDeleteStrategy.js';
import { FakemonEditStrategy } from './FakemonEditStrategy.js';
import { FakemonTransferEditStrategy } from './FakemonTransferEditStrategy.js';
import { FakemonTransferStrategy } from './FakemonTransferStrategy.js';
import { FakemonTransferTypeShiftStrategy } from './FakemonTransferTypeShiftStrategy.js';
import { FakemonViewAllStrategy } from './FakemonViewAllStrategy.js';
import { FakemonViewStrategy } from './FakemonViewStrategy.js';

export default {
    [FakemonCreateStrategy.key]: FakemonCreateStrategy,
    [FakemonDeleteStrategy.key]: FakemonDeleteStrategy,
    [FakemonEditStrategy.key]: FakemonEditStrategy,
    [FakemonTransferStrategy.key]: FakemonTransferStrategy,
    [FakemonTransferEditStrategy.key]: FakemonTransferEditStrategy,
    [FakemonTransferTypeShiftStrategy.key]: FakemonTransferTypeShiftStrategy,
    [FakemonViewAllStrategy.key]: FakemonViewAllStrategy,
    [FakemonViewStrategy.key]: FakemonViewStrategy,
};
