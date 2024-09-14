import { ChatInputCommandInteraction } from 'discord.js';

import { PtuSubcommandGroup } from '../../options/subcommand-groups/index.js';
import { PtuLookupSubcommand } from '../../options/subcommand-groups/ptu/lookup.js';
import { PtuRandomSubcommand } from '../../options/subcommand-groups/ptu/random.js';
import { NestedChatIteractionStrategyRecord } from '../ChatIteractionStrategy.js';

import lookupStrategies from './lookup/index.js';
import randomStrategies from './random/index.js';
import { PtuMove } from '../../../models/PtuMove.js';
import { PtuAbility } from '../../../models/PtuAbility.js';
import { PtuTm } from '../../../models/PtuTm.js';
import { GetLookupMoveDataParameters } from './lookup/LookupMoveStrategy.js';
import { GetLookupAbilityDataParameters } from './lookup/LookupAbilityStrategy.js';
import { GetLookupTmDataParameters } from './lookup/LookupTmStrategy.js';

export class PtuStrategyExecutor
{
    private static strategies: (NestedChatIteractionStrategyRecord<
        PtuSubcommandGroup.Lookup,
        PtuLookupSubcommand
    > | NestedChatIteractionStrategyRecord<
        PtuSubcommandGroup.Random,
        PtuRandomSubcommand
    >);

    static {
        // @ts-ignore -- TODO: Fix this type later
        this.strategies = {
            [PtuSubcommandGroup.Lookup]: lookupStrategies,
            // @ts-ignore -- TODO: Fix this type later
            [PtuSubcommandGroup.Random]: randomStrategies,
        };
    }

    public static async run({
        subcommandGroup,
        subcommand,
        interaction,
    }: {
        subcommandGroup: PtuSubcommandGroup;
        subcommand: PtuLookupSubcommand | PtuRandomSubcommand;
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

    public static async getLookupData<PtuLookupModel extends PtuAbility | PtuMove | PtuTm>({
        subcommandGroup,
        subcommand,
        options
    }: {
        subcommandGroup: PtuSubcommandGroup;
        subcommand: PtuLookupSubcommand | PtuRandomSubcommand;
        options?: PtuLookupModel extends PtuMove
            ? GetLookupMoveDataParameters
            : PtuLookupModel extends PtuAbility
            ? GetLookupAbilityDataParameters
            : PtuLookupModel extends PtuTm
            ? GetLookupTmDataParameters
            : never;
    }): Promise<PtuLookupModel[]>
    {
        // @ts-ignore -- TODO: Fix this type later
        const Strategy = this.strategies[subcommandGroup][subcommand];

        if (Strategy)
        {
            return await Strategy.getLookupData(options);
        }

        return [];
    }
}
