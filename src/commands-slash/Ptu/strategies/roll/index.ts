import { RollAlchemyStrategy } from './RollAlchemyStrategy.js';
import { RollAttackStrategy } from './RollAttackStrategy.js';
import { RollCaptureStrategy } from './RollCaptureStrategy.js';
import { RollFiveStrikeStrategy } from './RollFiveStrikeStrategy.js';
import { RollSkillStrategy } from './RollSkillStrategy.js';

export default {
    [RollAlchemyStrategy.key]: RollAlchemyStrategy,
    [RollAttackStrategy.key]: RollAttackStrategy,
    [RollCaptureStrategy.key]: RollCaptureStrategy,
    [RollFiveStrikeStrategy.key]: RollFiveStrikeStrategy,
    [RollSkillStrategy.key]: RollSkillStrategy,
};
