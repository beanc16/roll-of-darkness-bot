import { ChatInputCommandInteraction } from 'discord.js';

import { BaseLookupStrategy } from '../../strategies/BaseLookupStrategy.js';
import { BaseStrategyExecutor } from '../../strategies/BaseStrategyExecutor.js';
import { StrategyMap } from '../../strategies/types/ChatIteractionStrategy.js';
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
}

type AllLookupParams = GetLookupTrickDataParameters;

type CurseborneStrategyMap = StrategyMap<
    CurseborneSubcommandGroup,
    CurseborneSubcommand | CurseborneLookupSubcommand
>;

export class CurseborneStrategyExecutor extends BaseStrategyExecutor
{
    protected static strategies: CurseborneStrategyMap = {
        [CurseborneSubcommandGroup.Lookup]: {
            [LookupTrickStrategy.key]: LookupTrickStrategy,
        },
        [RollStrategy.key]: RollStrategy,
    };

    public static async run({
        subcommandGroup,
        subcommand,
        interaction,
    }: CursebourneStrategyExecutorRunParameters): Promise<boolean>
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

    public static async getLookupData<ClassInstance extends { name: string }>({
        subcommandGroup,
        subcommand,
        lookupParams,
    }: Pick<CursebourneStrategyExecutorRunParameters, 'subcommandGroup' | 'subcommand'> & { lookupParams: AllLookupParams }): Promise<ClassInstance[]>
    {
        const Strategy = this.getStrategy({
            strategies: this.strategies,
            subcommandGroup,
            subcommand,
        }) as BaseLookupStrategy<AllLookupParams, ClassInstance>;

        if (Strategy)
        {
            return await Strategy.getLookupData(lookupParams);
        }

        return [];
    }
}
