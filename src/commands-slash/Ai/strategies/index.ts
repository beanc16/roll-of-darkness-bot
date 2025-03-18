import { ChatInputCommandInteraction } from 'discord.js';

import { BaseStrategyExecutor } from '../../strategies/BaseStrategyExecutor.js';
import { StrategyMap } from '../../strategies/types/ChatIteractionStrategy.js';
import { AiGenerateSubcommand } from '../options/generate.js';
import { AiSubcommandGroup } from '../options/index.js';
import generateStrategies from './generate/index.js';

interface AiStrategyExecutorRunParameters
{
    subcommandGroup: AiSubcommandGroup;
    subcommand: AiGenerateSubcommand;
    interaction: ChatInputCommandInteraction;
};

type AiStrategyMap = StrategyMap<
    AiSubcommandGroup,
    AiGenerateSubcommand
>;

export class AiStrategyExecutor extends BaseStrategyExecutor
{
    private static strategies: AiStrategyMap = {
        [AiSubcommandGroup.Generate]: generateStrategies,
    };

    public static async run({
        subcommandGroup,
        subcommand,
        interaction,
    }: AiStrategyExecutorRunParameters): Promise<boolean>
    {
        const Strategy = this.getStrategy({
            strategies: this.strategies,
            subcommandGroup,
            subcommand,
        });

        if (Strategy)
        {
            return await Strategy.run(interaction);
        }

        return false;
    }
}
