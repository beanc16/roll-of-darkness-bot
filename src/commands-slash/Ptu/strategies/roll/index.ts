import { RollAttackStrategy } from './RollAttackStrategy.js';
import { RollCaptureStrategy } from './RollCaptureStrategy.js';
import { RollSkillStrategy } from './RollSkillStrategy.js';

export default {
    [RollAttackStrategy.key]: RollAttackStrategy,
    [RollCaptureStrategy.key]: RollCaptureStrategy,
    [RollSkillStrategy.key]: RollSkillStrategy,
};
