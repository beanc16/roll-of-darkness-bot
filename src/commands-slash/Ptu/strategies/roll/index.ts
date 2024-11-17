import { ChatIteractionStrategyRecord } from '../../../strategies/types/ChatIteractionStrategy.js';
import { PtuRollSubcommand } from '../../subcommand-groups/roll.js';
import { RollAttackStrategy } from './RollAttackStrategy.js';
import { RollCaptureStrategy } from './RollCaptureStrategy.js';

export default {
    [RollAttackStrategy.key]: RollAttackStrategy,
    [RollCaptureStrategy.key]: RollCaptureStrategy,
} as ChatIteractionStrategyRecord<PtuRollSubcommand>;
