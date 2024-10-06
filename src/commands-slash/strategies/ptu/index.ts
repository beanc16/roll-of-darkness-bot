import { ChatInputCommandInteraction } from 'discord.js';

import { PtuQuickReferenceInfo, PtuSubcommandGroup } from '../../options/subcommand-groups/index.js';
import { PtuLookupSubcommand } from '../../options/subcommand-groups/ptu/lookup.js';
import { PtuRandomSubcommand } from '../../options/subcommand-groups/ptu/random.js';
import { NestedChatIteractionStrategyRecord } from '../ChatIteractionStrategy.js';

import lookupStrategies from './lookup/index.js';
import quickReferenceStrategies from './quickReference/index.js';
import randomStrategies from './random/index.js';
import { PtuMove } from '../../../models/PtuMove.js';
import { PtuAbility } from '../../../models/PtuAbility.js';
import { PtuTm } from '../../../models/PtuTm.js';
import { GetLookupMoveDataParameters } from './lookup/LookupMoveStrategy.js';
import { GetLookupAbilityDataParameters } from './lookup/LookupAbilityStrategy.js';
import { GetLookupTmDataParameters } from './lookup/LookupTmStrategy.js';
import { PtuNature } from '../../../models/PtuNature.js';
import { GetLookupNatureDataParameters } from './lookup/LookupNatureStrategy.js';
import { GetLookupPokemonDataParameters } from './lookup/LookupPokemonStrategy.js';
import { PtuPokemon } from '../../../types/pokemon.js';
import { TrainPokemonStrategy } from './train/TrainPokemonStrategy.js';

export class PtuStrategyExecutor
{
    private static strategies: (NestedChatIteractionStrategyRecord<
        PtuSubcommandGroup.Lookup,
        PtuLookupSubcommand
    > | NestedChatIteractionStrategyRecord<
        PtuSubcommandGroup.QuickReference,
        PtuQuickReferenceInfo
    > | NestedChatIteractionStrategyRecord<
        PtuSubcommandGroup.Random,
        PtuRandomSubcommand
    >);

    static {
        // @ts-ignore -- TODO: Fix this type later
        this.strategies = {
            [PtuSubcommandGroup.Lookup]: lookupStrategies,
            // @ts-ignore -- TODO: Fix this type later
            [PtuSubcommandGroup.QuickReference]: quickReferenceStrategies,
            // @ts-ignore -- TODO: Fix this type later
            [PtuSubcommandGroup.Random]: randomStrategies,
            // @ts-ignore -- TODO: Fix this type later
            [PtuSubcommandGroup.Train]: TrainPokemonStrategy,
        };
    }

    public static async run({
        subcommandGroup,
        subcommand,
        interaction,
    }: {
        subcommandGroup: PtuSubcommandGroup;
        subcommand: PtuLookupSubcommand | PtuRandomSubcommand | PtuSubcommandGroup.QuickReference | PtuSubcommandGroup.Train;
        interaction: ChatInputCommandInteraction;
    }): Promise<boolean>
    {
        let Strategy;

        if (subcommand === PtuSubcommandGroup.QuickReference)
        {
            const referenceInfo = interaction.options.getString('reference_info', true) as PtuQuickReferenceInfo;

            // @ts-ignore -- TODO: Fix this type later
            Strategy = this.strategies[subcommand][referenceInfo];
        }
        else if (subcommand === PtuSubcommandGroup.Train)
        {
            // @ts-ignore -- TODO: Fix this type later
            Strategy = this.strategies[subcommand];
        }
        else
        {
            // @ts-ignore -- TODO: Fix this type later
            Strategy = this.strategies[subcommandGroup][subcommand];
        }

        if (Strategy)
        {
            return await Strategy.run(interaction);
        }

        return false;
    }

    public static async getLookupData<PtuLookupModel extends PtuAbility | PtuMove | PtuNature | PtuPokemon | PtuTm>({
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
            : PtuLookupModel extends PtuNature
            ? GetLookupNatureDataParameters
            : PtuLookupModel extends PtuPokemon
            ? GetLookupPokemonDataParameters
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
