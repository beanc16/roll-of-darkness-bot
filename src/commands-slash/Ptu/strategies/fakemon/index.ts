import { FakemonCreateStrategy } from './FakemonCreateStrategy.js';
import { FakemonDeleteStrategy } from './FakemonDeleteStrategy.js';
import { FakemonEditStrategy } from './FakemonEditStrategy.js';
import { FakemonViewAllStrategy } from './FakemonViewAllStrategy.js';
import { FakemonViewStrategy } from './FakemonViewStrategy.js';

export default {
    [FakemonCreateStrategy.key]: FakemonCreateStrategy,
    [FakemonDeleteStrategy.key]: FakemonDeleteStrategy,
    [FakemonEditStrategy.key]: FakemonEditStrategy,
    [FakemonViewAllStrategy.key]: FakemonViewAllStrategy,
    [FakemonViewStrategy.key]: FakemonViewStrategy,
};
