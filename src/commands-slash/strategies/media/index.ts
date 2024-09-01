import { ChatInputCommandInteraction } from 'discord.js';

import { MediaSubcommandGroup } from '../../options/subcommand-groups/index.js';
import { MediaInstagramSubcommand } from '../../options/subcommand-groups/media/instagram.js';
import { NestedChatIteractionStrategyRecord } from '../ChatIteractionStrategy.js';

import imageStrategies from './image/index.js';
import instagramStrategies from './instagram/index.js';
import { MediaImageSubcommand } from '../../options/subcommand-groups/media/image.js';

export class MediaStrategyExecutor
{
    private static strategies: (NestedChatIteractionStrategyRecord<
        MediaSubcommandGroup.Image,
        MediaImageSubcommand
    > | NestedChatIteractionStrategyRecord<
        MediaSubcommandGroup.Instagram,
        MediaInstagramSubcommand
    >);

    static {
        // @ts-ignore -- TODO: Fix this type later
        this.strategies = {
            [MediaSubcommandGroup.Image]: imageStrategies,
            [MediaSubcommandGroup.Instagram]: instagramStrategies,
        };
    }

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
        // @ts-ignore -- TODO: Fix this type later
        const Strategy = this.strategies[subcommandGroup][subcommand];

        if (Strategy)
        {
            return await Strategy.run(interaction);
        }

        return false;
    }
}
