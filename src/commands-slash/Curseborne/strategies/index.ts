import { ChatInputCommandInteraction } from 'discord.js';

import { BaseLookupStrategy } from '../../strategies/BaseLookupStrategy.js';
import {
    ChatIteractionStrategy,
    ChatIteractionStrategyRecord,
    NestedChatIteractionStrategyRecord,
} from '../../strategies/types/ChatIteractionStrategy.js';
import {
    CurseborneAllNestedSubcommands,
    CurseborneSubcommand,
    CurseborneSubcommandGroup,
} from '../subcommand-groups/index.js';
import { CurseborneLookupSubcommand } from '../subcommand-groups/lookup.js';
import { GetLookupTrickDataParameters, LookupTrickStrategy } from './lookup/LookupTrickStrategy.js';
import { RollStrategy } from './RollStrategy.js';

interface CursebourneStrategyExecutorRunParameters
{
    subcommandGroup?: CurseborneSubcommandGroup;
    subcommand: CurseborneSubcommand | CurseborneAllNestedSubcommands;
    interaction: ChatInputCommandInteraction;
};

type AllNestedCursebourneChatInteractions = NestedChatIteractionStrategyRecord<
    CurseborneSubcommandGroup.Lookup,
    CurseborneLookupSubcommand
>;

type AllSubcommandCurseborneChatInteractions = ChatIteractionStrategyRecord<CurseborneSubcommand>;

type AllLookupParams = GetLookupTrickDataParameters;

export class CursebourneStrategyExecutor
{
    private static strategies: AllNestedCursebourneChatInteractions
        | AllSubcommandCurseborneChatInteractions;

    static
    {
        this.strategies = {
            [CurseborneSubcommandGroup.Lookup]: {
                [LookupTrickStrategy.key]: LookupTrickStrategy,
            },
            [RollStrategy.key]: RollStrategy,
        };
    }

    public static async run({
        subcommandGroup,
        subcommand,
        interaction,
    }: CursebourneStrategyExecutorRunParameters): Promise<boolean>
    {
        const Strategy = this.getStrategy({
            subcommandGroup,
            subcommand,
        });

        if (Strategy)
        {
            return await Strategy.run(interaction);
        }

        return false;
    }

    public static async getLookupData<ClassInstance extends { name: string }>({
        subcommandGroup,
        subcommand,
        lookupParams,
    }: Pick<CursebourneStrategyExecutorRunParameters, 'subcommandGroup' | 'subcommand'> & { lookupParams: AllLookupParams }): Promise<ClassInstance[]>
    {
        const Strategy = this.getStrategy({
            subcommandGroup,
            subcommand,
        }) as BaseLookupStrategy<AllLookupParams, ClassInstance>;

        if (Strategy)
        {
            return await Strategy.getLookupData(lookupParams);
        }

        return [];
    }

    private static getStrategy({ subcommandGroup, subcommand }: Pick<CursebourneStrategyExecutorRunParameters, 'subcommandGroup' | 'subcommand'>): ChatIteractionStrategy | undefined
    {
        if (subcommandGroup)
        {
            const strategies = this.strategies as AllNestedCursebourneChatInteractions;
            const nestedSubcommand = subcommand as CurseborneAllNestedSubcommands;
            return strategies[subcommandGroup][nestedSubcommand];
        }

        const strategies = this.strategies as AllSubcommandCurseborneChatInteractions;
        const unnestedSubcommand = subcommand as CurseborneSubcommand;
        return strategies[unnestedSubcommand];
    }
}
