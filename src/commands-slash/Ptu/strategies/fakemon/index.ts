import { FakemonCreateStrategy } from './FakemonCreateStrategy.js';
import { FakemonEditStrategy } from './FakemonEditStrategy.js';

export default {
    [FakemonCreateStrategy.key]: FakemonCreateStrategy,
    [FakemonEditStrategy.key]: FakemonEditStrategy,
};
