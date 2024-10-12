import { ChatInputCommandInteraction } from 'discord.js';

import { PtuQuickReferenceInfo, PtuSubcommandGroup } from '../subcommand-groups/index.js';
import { PtuCalculateSubcommand } from '../subcommand-groups/calculate.js';
import { PtuLookupSubcommand } from '../subcommand-groups/lookup.js';
import { PtuRandomSubcommand } from '../subcommand-groups/random.js';
import { PtuRollSubcommand } from '../subcommand-groups/roll.js';
import { NestedChatIteractionStrategyRecord } from '../../strategies/ChatIteractionStrategy.js';

import calculateStrategies from './calculate/index.js';
import lookupStrategies from './lookup/index.js';
import quickReferenceStrategies from './quickReference/index.js';
import randomStrategies from './random/index.js';
import rollStrategies from './roll/index.js';

import { PtuAbility } from '../models/PtuAbility.js';
import { PtuCapability } from '../models/PtuCapability.js';
import { PtuMove } from '../models/PtuMove.js';
import { PtuNature } from '../models/PtuNature.js';
import { PtuPokemon } from '../types/pokemon.js';
import { PtuStatus } from '../models/PtuStatus.js';
import { PtuTm } from '../models/PtuTm.js';

import { GetLookupMoveDataParameters } from './lookup/LookupMoveStrategy.js';
import { GetLookupAbilityDataParameters } from './lookup/LookupAbilityStrategy.js';
import { GetLookupCapabilityDataParameters } from './lookup/LookupCapabilityStrategy.js';
import { GetLookupTmDataParameters } from './lookup/LookupTmStrategy.js';
import { GetLookupNatureDataParameters } from './lookup/LookupNatureStrategy.js';
import { GetLookupPokemonDataParameters } from './lookup/LookupPokemonStrategy.js';
import { GetLookupStatusDataParameters } from './lookup/LookupStatusStrategy.js';
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
    > | NestedChatIteractionStrategyRecord<
        PtuSubcommandGroup.Calculate,
        PtuCalculateSubcommand
    > | NestedChatIteractionStrategyRecord<
        PtuSubcommandGroup.Roll,
        PtuRollSubcommand
    >);

    static {
        // @ts-ignore -- TODO: Fix this type later
        this.strategies = {
            // @ts-ignore -- TODO: Fix this type later
            [PtuSubcommandGroup.Calculate]: calculateStrategies,
            [PtuSubcommandGroup.Lookup]: lookupStrategies,
            // @ts-ignore -- TODO: Fix this type later
            [PtuSubcommandGroup.QuickReference]: quickReferenceStrategies,
            // @ts-ignore -- TODO: Fix this type later
            [PtuSubcommandGroup.Random]: randomStrategies,
            // @ts-ignore -- TODO: Fix this type later
            [PtuSubcommandGroup.Roll]: rollStrategies,
            [PtuSubcommandGroup.Train]: TrainPokemonStrategy,
        };
    }

    public static async run({
        subcommandGroup,
        subcommand,
        interaction,
    }: {
        subcommandGroup: PtuSubcommandGroup;
        subcommand: PtuLookupSubcommand | PtuRandomSubcommand | PtuCalculateSubcommand | PtuSubcommandGroup.QuickReference | PtuSubcommandGroup.Train;
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

    public static async getLookupData<PtuLookupModel extends PtuAbility | PtuCapability | PtuMove | PtuNature | PtuPokemon | PtuStatus | PtuTm>({
        subcommandGroup,
        subcommand,
        options
    }: {
        subcommandGroup: PtuSubcommandGroup;
        subcommand: PtuLookupSubcommand | PtuRandomSubcommand;
        options?: PtuLookupModel extends PtuMove    // Move
            ? GetLookupMoveDataParameters
            : PtuLookupModel extends PtuAbility     // Ability
            ? GetLookupAbilityDataParameters
            : PtuLookupModel extends PtuCapability  // Capability
            ? GetLookupCapabilityDataParameters
            : PtuLookupModel extends PtuNature      // Nature
            ? GetLookupNatureDataParameters
            : PtuLookupModel extends PtuPokemon     // Pokemon
            ? GetLookupPokemonDataParameters
            : PtuLookupModel extends PtuStatus      // Status
            ? GetLookupStatusDataParameters
            : PtuLookupModel extends PtuTm          // TM
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
