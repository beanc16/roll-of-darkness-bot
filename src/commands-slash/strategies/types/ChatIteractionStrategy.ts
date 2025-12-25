import { ButtonInteraction, ChatInputCommandInteraction, StringSelectMenuInteraction } from 'discord.js';

import {
    BaseStrategy,
    BaseStrategyRecord,
    NestedBaseStrategyRecord,
} from './BaseStrategy.js';

export type ChatIteractionStrategy = BaseStrategy<
    ChatInputCommandInteraction,
    Promise<boolean>
>;

export type ChatIteractionStrategyRecord<Key extends string> = BaseStrategyRecord<
    Key,
    ChatIteractionStrategy
>;

export type NestedChatIteractionStrategyRecord<
    Key1 extends string,
    Key2 extends string,
> = NestedBaseStrategyRecord<Key1, ChatIteractionStrategyRecord<Key2>>;

export type ButtonIteractionStrategy = BaseStrategy<
    ButtonInteraction,
    Promise<boolean>
>;

export type StringSelectMenuIteractionStrategy = BaseStrategy<
    StringSelectMenuInteraction,
    Promise<boolean>
>;

export type StrategyMap<SubcommandGroup extends string, Subcommand extends string, Strategy = ChatIteractionStrategy> = {
    [Group in SubcommandGroup]: {
        [Command in Subcommand]?: Strategy;
    };
} & {
    [Command in Subcommand]?: Strategy;
};
