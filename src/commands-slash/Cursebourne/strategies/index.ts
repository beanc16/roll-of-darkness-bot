import { ChatInputCommandInteraction } from 'discord.js';

import { ChatIteractionStrategyRecord } from '../../strategies/ChatIteractionStrategy.js';

import { RollStrategy } from './RollStrategy.js';
import { CursebourneSubcommand } from '../subcommand-groups/index.js';

export class CursebourneStrategyExecutor
{
    private static strategies: ChatIteractionStrategyRecord<CursebourneSubcommand>;

    static {
        this.strategies = {
            [RollStrategy.key]: RollStrategy,
        };
    }

    public static async run({
        subcommand,
        interaction,
    }: {
        subcommand: CursebourneSubcommand;
        interaction: ChatInputCommandInteraction;
    }): Promise<boolean>
    {
        const Strategy = this.strategies[subcommand];

        if (Strategy)
        {
            return await Strategy.run(interaction);
        }

        return false;
    }
}
