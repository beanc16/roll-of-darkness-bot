import { selectMenuCustomIds } from '../select-menus/combat_tracker.js';
import characterOptionStrategies from './characterOption/index.js';
import initiativeStrategies from './initiative/index.js';
import { NestedCombatTrackerIteractionStrategyRecord } from './types/CombatTrackerIteractionStrategy.js';
import { CombatTrackerMessageComponentHandlerParameters } from './types/CombatTrackerMessageComponentHandlerParameters.js';

export class CombatTrackerStrategyExecutor
{
    // TODO: Update this to use StrategyMap type later.
    private static strategies: (NestedCombatTrackerIteractionStrategyRecord<
        string,
        string
    >) = {
            [selectMenuCustomIds.characterOptionSelect]: characterOptionStrategies,
            [selectMenuCustomIds.initiativeSelect]: initiativeStrategies,
        };

    public static async run({
        subcommandGroup,
        subcommand,
        interaction,
        tracker,
    }: {
        subcommandGroup: string;
        subcommand: string;
    } & CombatTrackerMessageComponentHandlerParameters): Promise<boolean>
    {
        const Strategy = this.strategies[subcommandGroup][subcommand];

        if (Strategy)
        {
            await Strategy.run({
                interaction,
                tracker,
            });
        }

        return false;
    }
}
