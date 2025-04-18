import { QueueAddStrategy } from './QueueAddStrategy.js';
import { QueueViewStrategy } from './QueueViewStrategy.js';

export default {
    [QueueAddStrategy.key]: QueueAddStrategy,
    [QueueViewStrategy.key]: QueueViewStrategy,
};
