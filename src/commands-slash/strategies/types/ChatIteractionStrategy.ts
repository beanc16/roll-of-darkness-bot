import { ChatInputCommandInteraction } from 'discord.js';

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
