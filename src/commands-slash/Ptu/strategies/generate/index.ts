import { GenerateMoveStrategy } from './GenerateMoveStrategy.js';
import { GenerateMoveNamesStrategy } from './GenerateMoveNamesStrategy.js';
import { GenerateSkillBackgroundStrategy } from './GenerateSkillBackgroundStrategy.js';

export default {
    [GenerateMoveStrategy.key]: GenerateMoveStrategy,
    [GenerateMoveNamesStrategy.key]: GenerateMoveNamesStrategy,
    [GenerateSkillBackgroundStrategy.key]: GenerateSkillBackgroundStrategy,
};
