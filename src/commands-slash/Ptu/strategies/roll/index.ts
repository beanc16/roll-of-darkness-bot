import { RollAlchemyStrategy } from './RollAlchemyStrategy.js';
import { RollAttackStrategy } from './RollAttackStrategy.js';
import { RollCaptureStrategy } from './RollCaptureStrategy.js';
import { RollSkillStrategy } from './RollSkillStrategy.js';

export default {
    [RollAlchemyStrategy.key]: RollAlchemyStrategy,
    [RollAttackStrategy.key]: RollAttackStrategy,
    [RollCaptureStrategy.key]: RollCaptureStrategy,
    [RollSkillStrategy.key]: RollSkillStrategy,
};
