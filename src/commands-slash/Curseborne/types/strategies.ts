import { ButtonInteraction, ChatInputCommandInteraction } from 'discord.js';

import { ChatIteractionStrategy, StrategyMap } from '../../strategies/types/ChatIteractionStrategy.js';
import { CurseborneSubcommand, CurseborneSubcommandGroup } from '../options/index.js';
import { CurseborneLookupSubcommand } from '../options/lookup.js';

export interface CurseborneChatIteractionStrategy<
    Response = boolean,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Allow in this case
    Options = Record<string, any>,
> extends Omit<ChatIteractionStrategy, 'run'>
{
    run(
        interaction: ChatInputCommandInteraction | ButtonInteraction,
        strategies: CurseborneStrategyMap,
        options?: Options,
    ): Promise<Response>;
}

export interface CurseborneLookupIteractionStrategy<Response = boolean> extends CurseborneChatIteractionStrategy<Response>
{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Allow in this case
    getLookupData(input?: Record<any, any>): Promise<Record<any, any>[]>;
}

export type CurseborneStrategyMap = StrategyMap<
    CurseborneSubcommandGroup,
    CurseborneSubcommand
>
& StrategyMap<CurseborneSubcommandGroup.Lookup, CurseborneLookupSubcommand, CurseborneLookupIteractionStrategy>;
