import { FakemonCreateStrategy } from './FakemonCreateStrategy.js';
import { FakemonDeleteStrategy } from './FakemonDeleteStrategy.js';
import { FakemonEditStrategy } from './FakemonEditStrategy.js';
import { FakemonViewStrategy } from './FakemonViewStrategy.js';

export default {
    [FakemonCreateStrategy.key]: FakemonCreateStrategy,
    [FakemonDeleteStrategy.key]: FakemonDeleteStrategy,
    [FakemonEditStrategy.key]: FakemonEditStrategy,
    [FakemonViewStrategy.key]: FakemonViewStrategy,
};
