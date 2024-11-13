import { ChatInputCommandInteraction } from 'discord.js';

import { ChatIteractionStrategyRecord } from '../../strategies/types/ChatIteractionStrategy.js';
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

export class NwodStrategyExecutor
{
    private static strategies: AllSubcommandNwoChatInteractions;

    static {
        this.strategies = [
            RollStrategy,
            InitiativeStrategy,
            ChanceStrategy,
            LuckStrategy,
        ].reduce<AllSubcommandNwoChatInteractions>((acc, cur) =>
        {
            acc[cur.key] = cur;
            return acc;
        }, {} as any);
    }

    public static async run({
        subcommand,
        interaction,
    }: NwodStrategyExecutorRunParameters): Promise<boolean>
    {
        const Strategy = this.strategies[subcommand];

        if (Strategy)
        {
            return await Strategy.run(interaction);
        }

        return false;
    }
}
