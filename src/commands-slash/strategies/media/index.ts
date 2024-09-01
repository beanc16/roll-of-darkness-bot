import { ChatInputCommandInteraction } from 'discord.js';

import { MediaSubcommandGroup } from '../../options/subcommand-groups/index.js';
import { MediaInstagramSubcommand } from '../../options/subcommand-groups/media/instagram.js';
import { NestedChatIteractionStrategyRecord } from '../ChatIteractionStrategy.js';

import instagramStrategies from './instagram/index.js';

export class MediaStrategyExecutor
{
    private static strategies: NestedChatIteractionStrategyRecord<
        MediaSubcommandGroup,
        MediaInstagramSubcommand
    >;

    static {
        this.strategies = {
            [MediaSubcommandGroup.Instagram]: instagramStrategies,
        };
    }

    public static async run({
        subcommandGroup,
        subcommand,
        interaction,
    }: {
        subcommandGroup: MediaSubcommandGroup;
        subcommand: MediaInstagramSubcommand;
        interaction: ChatInputCommandInteraction;
    }): Promise<boolean>
    {
        const Strategy = this.strategies[subcommandGroup][subcommand];

        if (Strategy)
        {
            return await Strategy.run(interaction);
        }

        return false;
    }
}
