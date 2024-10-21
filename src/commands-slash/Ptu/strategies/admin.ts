import { ChatInputCommandInteraction } from 'discord.js';

import { ChatIteractionStrategyRecord } from '../../strategies/ChatIteractionStrategy.js';
import { PtuAdminSubcommand } from '../subcommand-groups/admin.js';
import { AdminCopyStrategy } from './admin/AdminCopyStrategy.js';

export class PtuAdminStrategyExecutor
{
    private static strategies: (ChatIteractionStrategyRecord<PtuAdminSubcommand>);

    static {
        this.strategies = {
            [PtuAdminSubcommand.Copy]: AdminCopyStrategy,
        };
    }

    public static async run({
        subcommand,
        interaction,
    }: {
        subcommand: PtuAdminSubcommand;
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
