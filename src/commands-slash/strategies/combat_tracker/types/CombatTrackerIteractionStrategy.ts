import { BaseStrategy, BaseStrategyRecord, NestedBaseStrategyRecord } from '../../BaseStrategy.js';
import { CombatTrackerMessageComponentHandlerParameters } from './CombatTrackerMessageComponentHandlerParameters.js';

export type CombatTrackerIteractionStrategy = BaseStrategy<
    CombatTrackerMessageComponentHandlerParameters,
    Promise<void>
>;

export type CombatTrackerIteractionStrategyRecord<Key extends string> = BaseStrategyRecord<
    Key,
    CombatTrackerIteractionStrategy
>;

export type NestedCombatTrackerIteractionStrategyRecord<
    Key1 extends string,
    Key2 extends string
> = NestedBaseStrategyRecord<Key1, CombatTrackerIteractionStrategyRecord<Key2>>;
