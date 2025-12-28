import {
    ButtonInteraction,
    ChatInputCommandInteraction,
    Message,
    StringSelectMenuInteraction,
} from 'discord.js';

import {
    ButtonIteractionStrategy,
    ChatIteractionStrategy,
    StrategyMap,
    StringSelectMenuIteractionStrategy,
} from '../../strategies/types/ChatIteractionStrategy.js';
import { PtuBreedSubcommand } from '../options/breed.js';
import { PtuCalculateSubcommand } from '../options/calculate.js';
import { PtuFakemonSubcommand } from '../options/fakemon.js';
import { PtuGameSubcommand } from '../options/game.js';
import { PtuGenerateSubcommand } from '../options/generate.js';
import { PtuQuickReferenceInfo, PtuSubcommandGroup } from '../options/index.js';
import { PtuLookupSubcommand } from '../options/lookup.js';
import { PtuMetadataSubcommand } from '../options/metadata.js';
import { PtuRandomSubcommand } from '../options/random.js';
import { PtuRollSubcommand } from '../options/roll.js';
import { PtuTrainSubcommand } from '../options/train.js';
import { PtuTypeEffectivenessSubcommand } from '../options/typeEffectiveness.js';
import { PtuRandomPickupSubcommandResponse, PtuRandomPickupSubcommandStrategy } from '../strategies/random/types.js';

export interface PtuStrategyMetadata
{
    message: Message;
    commandName: string;
    subcommandGroup: PtuSubcommandGroup;
    subcommand: PtuFakemonSubcommand;
}

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

export interface PtuButtonIteractionStrategy<
    Response = boolean,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Allow in this case
    Options = Record<string, any>,
> extends Omit<ButtonIteractionStrategy, 'run'>
{
    runButton(
        interaction: ButtonInteraction,
        strategies: PtuStrategyMap,
        metadata: PtuStrategyMetadata,
        options?: Options,
    ): Promise<Response>;
}

export interface PtuStringSelectMenuIteractionStrategy<
    Response = boolean,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Allow in this case
    Options = Record<string, any>,
> extends Omit<StringSelectMenuIteractionStrategy, 'run'>
{
    runStringSelect(
        interaction: StringSelectMenuInteraction,
        strategies: PtuStrategyMap,
        metadata: PtuStrategyMetadata,
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
    | PtuFakemonSubcommand
    | PtuGameSubcommand
    | PtuGenerateSubcommand
    | PtuMetadataSubcommand
    | PtuQuickReferenceInfo
    | PtuRollSubcommand
    | PtuTrainSubcommand
    | PtuTypeEffectivenessSubcommand,
    PtuChatIteractionStrategy
>
& StrategyMap<PtuSubcommandGroup.Lookup, PtuLookupSubcommand, PtuLookupIteractionStrategy>
& StrategyMap<PtuSubcommandGroup.Random, PtuRandomSubcommand, PtuRandomPickupSubcommandStrategy | PtuChatIteractionStrategy | PtuChatIteractionStrategy<boolean | PtuRandomPickupSubcommandResponse>>;
