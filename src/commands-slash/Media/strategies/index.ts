import { ChatInputCommandInteraction } from 'discord.js';

import { BaseStrategyExecutor } from '../../strategies/BaseStrategyExecutor.js';
import { StrategyMap } from '../../strategies/types/ChatIteractionStrategy.js';
import { MediaImageSubcommand } from '../subcommand-groups/image.js';
import { MediaSubcommandGroup } from '../subcommand-groups/index.js';
import { MediaInstagramSubcommand } from '../subcommand-groups/instagram.js';
import imageStrategies from './image/index.js';
import instagramStrategies from './instagram/index.js';

type MediaStrategyMap = StrategyMap<
    MediaSubcommandGroup,
    MediaImageSubcommand | MediaInstagramSubcommand
>;

export class MediaStrategyExecutor extends BaseStrategyExecutor
{
    private static strategies: MediaStrategyMap = {
        [MediaSubcommandGroup.Image]: imageStrategies,
        [MediaSubcommandGroup.Instagram]: instagramStrategies,
    };

    public static async run({
        subcommandGroup,
        subcommand,
        interaction,
    }: {
        subcommandGroup: MediaSubcommandGroup;
        subcommand: MediaImageSubcommand | MediaInstagramSubcommand;
        interaction: ChatInputCommandInteraction;
    }): Promise<boolean>
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
