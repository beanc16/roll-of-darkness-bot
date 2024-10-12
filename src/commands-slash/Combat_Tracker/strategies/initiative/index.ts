import { EndCombatStrategy } from './EndCombatStrategy.js';
import { MoveTurnStrategy } from './MoveTurnStrategy.js';
import { NextTurnStrategy } from './NextTurnStrategy.js';
import { PreviousTurnStrategy } from './PreviousTurnStrategy.js';
import { StartCombatStrategy } from './StartCombatStrategy.js';

export default {
    [StartCombatStrategy.key]: StartCombatStrategy,
    [EndCombatStrategy.key]: EndCombatStrategy,
    [NextTurnStrategy.key]: NextTurnStrategy,
    [PreviousTurnStrategy.key]: PreviousTurnStrategy,
    [MoveTurnStrategy.key]: MoveTurnStrategy,
};
