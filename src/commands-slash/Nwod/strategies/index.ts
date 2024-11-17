import { ChatInputCommandInteraction } from 'discord.js';

import { BaseStrategyExecutor } from '../../strategies/BaseStrategyExecutor.js';
import { ChatIteractionStrategyRecord, StrategyMap } from '../../strategies/types/ChatIteractionStrategy.js';
import { NwodSubcommand } from '../options/index.js';
import { ChanceStrategy } from './ChanceStrategy.js';
import { InitiativeStrategy } from './InitiativeStrategy.js';
import { LuckStrategy } from './LuckStrategy.js';
import { RollStrategy } from './RollStrategy.js';

interface NwodStrategyExecutorRunParameters
{
    subcommand: NwodSubcommand;
    interaction: ChatInputCommandInteraction;
};

type AllSubcommandNwoChatInteractions = ChatIteractionStrategyRecord<NwodSubcommand>;

type NwodStrategyMap = StrategyMap<
    string, // This is actually never, but the types get messed up if never is used
    NwodSubcommand
>;

export class NwodStrategyExecutor extends BaseStrategyExecutor
{
    private static strategies: NwodStrategyMap = [
        RollStrategy,
        InitiativeStrategy,
        ChanceStrategy,
        LuckStrategy,
    ].reduce<AllSubcommandNwoChatInteractions>((acc, cur) =>
    {
        acc[cur.key] = cur;
        return acc;
    }, {} as AllSubcommandNwoChatInteractions);

    public static async run({ subcommand, interaction }: NwodStrategyExecutorRunParameters): Promise<boolean>
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
