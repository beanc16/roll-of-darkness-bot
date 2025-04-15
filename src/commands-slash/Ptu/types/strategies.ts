import { ButtonInteraction, ChatInputCommandInteraction } from 'discord.js';

import { ChatIteractionStrategy, StrategyMap } from '../../strategies/types/ChatIteractionStrategy.js';
import { PtuBreedSubcommand } from '../options/breed.js';
import { PtuCalculateSubcommand } from '../options/calculate.js';
import { PtuGameSubcommand } from '../options/game.js';
import { PtuGenerateSubcommand } from '../options/generate.js';
import { PtuQuickReferenceInfo, PtuSubcommandGroup } from '../options/index.js';
import { PtuLookupSubcommand } from '../options/lookup.js';
import { PtuRandomSubcommand } from '../options/random.js';
import { PtuRollSubcommand } from '../options/roll.js';
import { PtuTrainSubcommand } from '../options/train.js';
import { PtuTypeEffectivenessSubcommand } from '../options/typeEffectiveness.js';
import { PtuRandomPickupSubcommandResponse, PtuRandomPickupSubcommandStrategy } from '../strategies/random/types.js';

export interface PtuChatIteractionStrategy<
    Response = boolean,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Allow in this case
    Options = Record<string, any>,
> extends Omit<ChatIteractionStrategy, 'run'>
{
    run(
        interaction: ChatInputCommandInteraction | ButtonInteraction,
        strategies: PtuStrategyMap,
        options?: Options,
    ): Promise<Response>;
}

export interface PtuLookupIteractionStrategy<Response = boolean> extends PtuChatIteractionStrategy<Response>
{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Allow in this case
    getLookupData(input?: Record<any, any>): Promise<Record<any, any>[]>;
}

export type PtuStrategyMap = StrategyMap<
    PtuSubcommandGroup,
    PtuBreedSubcommand
    | PtuCalculateSubcommand
    | PtuGameSubcommand
    | PtuGenerateSubcommand
    | PtuQuickReferenceInfo
    | PtuRollSubcommand
    | PtuTrainSubcommand
    | PtuTypeEffectivenessSubcommand,
    PtuChatIteractionStrategy
>
& StrategyMap<PtuSubcommandGroup.Lookup, PtuLookupSubcommand, PtuLookupIteractionStrategy>
& StrategyMap<PtuSubcommandGroup.Random, PtuRandomSubcommand, PtuRandomPickupSubcommandStrategy | PtuChatIteractionStrategy | PtuChatIteractionStrategy<boolean | PtuRandomPickupSubcommandResponse>>;
