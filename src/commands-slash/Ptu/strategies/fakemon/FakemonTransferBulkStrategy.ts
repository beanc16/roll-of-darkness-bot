import {
    ButtonInteraction,
    ChatInputCommandInteraction,
    StringSelectMenuInteraction,
} from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { PtuFakemonSubcommand } from '../../options/fakemon.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import type {
    PtuButtonIteractionStrategy,
    PtuChatIteractionStrategy,
    PtuStrategyMap,
    PtuStrategyMetadata,
} from '../../types/strategies.js';
import type { FakemonTransferGetParameterResults, FakemonTransferStrategy } from './FakemonTransferStrategy.js';

@staticImplements<
    PtuChatIteractionStrategy
    & PtuButtonIteractionStrategy
>()
export class FakemonTransferBulkStrategy
{
    public static key = PtuFakemonSubcommand.TransferBulk;

    public static async run(interaction: ChatInputCommandInteraction, strategies: PtuStrategyMap, options?: never): Promise<boolean>;
    public static async run(interaction: ButtonInteraction, strategies: PtuStrategyMap, options?: Partial<FakemonTransferGetParameterResults>): Promise<boolean>;
    public static async run(interaction: StringSelectMenuInteraction, strategies: PtuStrategyMap, options?: Partial<FakemonTransferGetParameterResults>): Promise<boolean>;
    public static async run(
        interaction: ChatInputCommandInteraction | ButtonInteraction | StringSelectMenuInteraction,
        strategies: PtuStrategyMap,
        options?: Partial<FakemonTransferGetParameterResults>,
    ): Promise<boolean>
    {
        return await this.getTransferStrategy(strategies)?.run(
            interaction as ButtonInteraction,
            strategies,
            options,
        );
    }

    public static async runButton(
        interaction: ButtonInteraction,
        strategies: PtuStrategyMap,
        metadata: PtuStrategyMetadata,
    ): Promise<boolean>
    {
        return await this.getTransferStrategy(strategies)?.runButton(
            interaction,
            strategies,
            metadata,
        );
    }

    private static getTransferStrategy(strategies: PtuStrategyMap): typeof FakemonTransferStrategy
    {
        return strategies[PtuSubcommandGroup.Fakemon][PtuFakemonSubcommand.Transfer] as typeof FakemonTransferStrategy;
    }
}
