import { ChatInputCommandInteraction } from 'discord.js';

import { BaseStrategyExecutor } from '../../strategies/BaseStrategyExecutor.js';
import { StrategyMap } from '../../strategies/types/ChatIteractionStrategy.js';
import { VcSubcommand } from '../options/index.js';

interface AdminStrategyExecutorRunParameters
{
    subcommand: VcSubcommand;
    interaction: ChatInputCommandInteraction;
};

type VcStrategyMap = StrategyMap<
    string, // This is actually never, but using never breaks the type
    VcSubcommand
>;

export class AdminStrategyExecutor extends BaseStrategyExecutor
{
    private static strategies: VcStrategyMap = [
        // TODO: Add strategies here later
    ].reduce<VcStrategyMap>((acc, cur) =>
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
