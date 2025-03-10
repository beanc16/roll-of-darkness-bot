import { ChatInputCommandInteraction } from 'discord.js';

import { BaseStrategyExecutor } from '../../strategies/BaseStrategyExecutor.js';
import { StrategyMap } from '../../strategies/types/ChatIteractionStrategy.js';
import { VcSubcommand } from '../options/index.js';
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
    subcommand: VcSubcommand;
    interaction: ChatInputCommandInteraction;
};

type VcStrategyMap = StrategyMap<
    string, // This is actually never used, but using never breaks the type
    VcSubcommand
>;

export class VcStrategyExecutor extends BaseStrategyExecutor
{
    private static strategies: VcStrategyMap = [
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
    ].reduce<VcStrategyMap>((acc, cur) =>
    {
        acc[cur.key] = cur;
        return acc;
    }, {});

    public static async run({ subcommand, interaction }: VcStrategyExecutorRunParameters): Promise<boolean>
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
