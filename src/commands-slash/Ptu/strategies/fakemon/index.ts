import { FakemonCreateStrategy } from './FakemonCreateStrategy.js';
import { FakemonDeleteStrategy } from './FakemonDeleteStrategy.js';
import { FakemonEditStrategy } from './FakemonEditStrategy.js';
import { FakemonTransferStrategy } from './FakemonTransferStrategy.js';
import { FakemonViewAllStrategy } from './FakemonViewAllStrategy.js';
import { FakemonViewStrategy } from './FakemonViewStrategy.js';

export default {
    [FakemonCreateStrategy.key]: FakemonCreateStrategy,
    [FakemonDeleteStrategy.key]: FakemonDeleteStrategy,
    [FakemonEditStrategy.key]: FakemonEditStrategy,
    [FakemonTransferStrategy.key]: FakemonTransferStrategy,
    [FakemonViewAllStrategy.key]: FakemonViewAllStrategy,
    [FakemonViewStrategy.key]: FakemonViewStrategy,
};
