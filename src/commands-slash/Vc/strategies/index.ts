import { ChatInputCommandInteraction } from 'discord.js';

import { BaseStrategyExecutor } from '../../strategies/BaseStrategyExecutor.js';
import { StrategyMap } from '../../strategies/types/ChatIteractionStrategy.js';
import { VcSubcommand, VcSubcommandGroup } from '../options/index.js';
import { VcQueueSubcommand } from '../options/queue.js';
import queueStrategies from './queue/index.js';
import { VcConnectStrategy } from './VcConnectStrategy.js';
import { VcDeleteFileStrategy } from './VcDeleteFileStrategy.js';
import { VcDisconnectStrategy } from './VcDisconnectStrategy.js';
import { VcLoadStrategy } from './VcLoadStrategy.js';
import { VcPauseStrategy } from './VcPauseStrategy.js';
import { VcPlayStrategy } from './VcPlayStrategy.js';
import { VcRenameFileStrategy } from './VcRenameFileStrategy.js';
import { VcStopStrategy } from './VcStopStrategy.js';
import { VcUnpauseStrategy } from './VcUnpauseStrategy.js';
import { VcUploadFileStrategy } from './VcUploadFileStrategy.js';
import { VcViewFilesStrategy } from './VcViewFilesStrategy.js';

interface VcStrategyExecutorRunParameters
{
    subcommandGroup?: VcSubcommandGroup;
    subcommand: VcSubcommand;
    interaction: ChatInputCommandInteraction;
};

type VcStrategyMap = StrategyMap<
    VcSubcommandGroup,
    VcSubcommand | VcQueueSubcommand
>;

export class VcStrategyExecutor extends BaseStrategyExecutor
{
    private static strategies: VcStrategyMap = {
        [VcSubcommandGroup.Queue]: queueStrategies,
        ...[ // Subcommands without a subcommand group
            VcConnectStrategy,
            VcDeleteFileStrategy,
            VcDisconnectStrategy,
            VcLoadStrategy,
            VcPauseStrategy,
            VcPlayStrategy,
            VcRenameFileStrategy,
            VcStopStrategy,
            VcUnpauseStrategy,
            VcUploadFileStrategy,
            VcViewFilesStrategy,
        ].reduce<Partial<VcStrategyMap>>((acc, cur) =>
        {
            acc[cur.key] = cur;
            return acc;
        }, {} as Partial<VcStrategyMap>),
    };

    public static async run({
        subcommandGroup,
        subcommand,
        interaction,
    }: VcStrategyExecutorRunParameters): Promise<boolean>
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
