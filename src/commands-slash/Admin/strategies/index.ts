import { ChatInputCommandInteraction } from 'discord.js';

import { BaseStrategyExecutor } from '../../strategies/BaseStrategyExecutor/BaseStrategyExecutor.js';
import { StrategyMap } from '../../strategies/types/ChatIteractionStrategy.js';
import { AdminSubcommand } from '../options/index.js';
import { RefreshCacheStrategy } from './RefreshCacheStrategy.js';

interface AdminStrategyExecutorRunParameters
{
    subcommand: AdminSubcommand;
    interaction: ChatInputCommandInteraction;
};

type AdminStrategyMap = StrategyMap<
    string, // This is actually never, but using never breaks the type
    AdminSubcommand
>;

export class AdminStrategyExecutor extends BaseStrategyExecutor
{
    private static strategies: AdminStrategyMap = [
        RefreshCacheStrategy,
    ].reduce<AdminStrategyMap>((acc, cur) =>
    {
        acc[cur.key] = cur;
        return acc;
    }, {});

    public static async run({ subcommand, interaction }: AdminStrategyExecutorRunParameters): Promise<boolean>
    {
        const Strategy = this.getStrategy({
            strategies: this.strategies,
            subcommand,
        });

        if (Strategy)
        {
            return await Strategy.run(interaction);
        }

        return false;
    }
}
