import { ChatIteractionStrategyRecord } from '../../../strategies/types/ChatIteractionStrategy.js';
import { PtuCalculateSubcommand } from '../../subcommand-groups/calculate.js';
import { CalculateBattleExpStrategy } from './CalculateBattleExpStrategy.js';
import { CalculateCaptureRatingStrategy } from './CalculateCaptureRatingStrategy.js';

export default {
    [CalculateBattleExpStrategy.key]: CalculateBattleExpStrategy,
    [CalculateCaptureRatingStrategy.key]: CalculateCaptureRatingStrategy,
} as ChatIteractionStrategyRecord<PtuCalculateSubcommand>;
