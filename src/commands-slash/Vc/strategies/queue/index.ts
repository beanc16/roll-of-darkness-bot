import { QueueAddStrategy } from './QueueAddStrategy.js';
import { QueueRemoveStrategy } from './QueueRemoveStrategy.js';
import { QueueViewStrategy } from './QueueViewStrategy.js';

export default {
    [QueueAddStrategy.key]: QueueAddStrategy,
    [QueueRemoveStrategy.key]: QueueRemoveStrategy,
    [QueueViewStrategy.key]: QueueViewStrategy,
};
