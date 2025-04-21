import { QueueAddStrategy } from './QueueAddStrategy.js';
import { QueueClearStrategy } from './QueueClearStrategy.js';
import { QueueRemoveStrategy } from './QueueRemoveStrategy.js';
import { QueueUpdateStrategy } from './QueueUpdateStrategy.js';
import { QueueViewStrategy } from './QueueViewStrategy.js';

export default {
    [QueueAddStrategy.key]: QueueAddStrategy,
    [QueueClearStrategy.key]: QueueClearStrategy,
    [QueueRemoveStrategy.key]: QueueRemoveStrategy,
    [QueueUpdateStrategy.key]: QueueUpdateStrategy,
    [QueueViewStrategy.key]: QueueViewStrategy,
};
