import { ChatIteractionStrategy, StrategyMap } from '../types/ChatIteractionStrategy.js';

interface GetStrategyOptions<SubcommandGroup extends string, Subcommand extends string>
{
    strategies: StrategyMap<SubcommandGroup, Subcommand>;
    subcommandGroup?: SubcommandGroup;
    subcommand: Subcommand;
}

export class BaseStrategyExecutor
{
    protected static getStrategy<SubcommandGroup extends string, Subcommand extends string>({
        strategies,
        subcommandGroup,
        subcommand,
    }: GetStrategyOptions<SubcommandGroup, Subcommand>): ChatIteractionStrategy | undefined
    {
        if (subcommandGroup)
        {
            const strategy = strategies[subcommandGroup]?.[subcommand];

            if (strategy)
            {
                return strategy;
            }
        }

        return strategies?.[subcommand];
    }
}
