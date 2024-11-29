import {
    ApplicationCommandOptionChoiceData,
    AutocompleteFocusedOption,
    ChatInputCommandInteraction,
} from 'discord.js';

import { MAX_AUTOCOMPLETE_CHOICES } from '../../../constants/discord.js';
import { Timer } from '../../../services/Timer.js';
import { BaseStrategyExecutor } from '../../strategies/BaseStrategyExecutor.js';
import { ChatIteractionStrategy, StrategyMap } from '../../strategies/types/ChatIteractionStrategy.js';
import { PtuAbility } from '../models/PtuAbility.js';
import { PtuMove } from '../models/PtuMove.js';
import { PtuCalculateSubcommand } from '../subcommand-groups/calculate.js';
import { PtuQuickReferenceInfo, PtuSubcommandGroup } from '../subcommand-groups/index.js';
import { PtuLookupSubcommand } from '../subcommand-groups/lookup.js';
import { PtuRandomSubcommand } from '../subcommand-groups/random.js';
import { PtuRollSubcommand } from '../subcommand-groups/roll.js';
import { PtuTrainSubcommand } from '../subcommand-groups/train.js';
import { PtuCompleteParameterName } from '../types/autcomplete.js';
import { GetLookupAbilityDataParameters, GetLookupMoveDataParameters } from '../types/modelParameters.js';
import { PtuPokemon } from '../types/pokemon.js';
import { PtuCapability } from '../types/PtuCapability.js';
import { PtuEdge } from '../types/PtuEdge.js';
import { PtuFeature } from '../types/PtuFeature.js';
import { PtuKeyword } from '../types/PtuKeyword.js';
import { PtuNature } from '../types/PtuNature.js';
import { PtuPokeball } from '../types/PtuPokeball.js';
import { PtuStatus } from '../types/PtuStatus.js';
import { PtuTm } from '../types/PtuTm.js';
import calculateStrategies from './calculate/index.js';
import lookupStrategies from './lookup/index.js';
import { GetLookupCapabilityDataParameters } from './lookup/LookupCapabilityStrategy.js';
import { GetLookupEdgeDataParameters } from './lookup/LookupEdgeStrategy.js';
import { GetLookupFeatureDataParameters } from './lookup/LookupFeatureStrategy.js';
import { GetLookupKeywordDataParameters } from './lookup/LookupKeywordStrategy.js';
import { GetLookupNatureDataParameters } from './lookup/LookupNatureStrategy.js';
import { GetLookupPokeballDataParameters } from './lookup/LookupPokeballStrategy.js';
import { GetLookupPokemonDataParameters } from './lookup/LookupPokemonStrategy.js';
import { GetLookupStatusDataParameters } from './lookup/LookupStatusStrategy.js';
import { GetLookupTmDataParameters } from './lookup/LookupTmStrategy.js';
import quickReferenceStrategies from './quickReference/index.js';
import randomStrategies from './random/index.js';
import rollStrategies from './roll/index.js';
import { TrainPokemonStrategy } from './train/TrainPokemonStrategy.js';

type AllPtuLookupModels = PtuAbility
    | PtuCapability
    | PtuEdge
    | PtuFeature
    | PtuKeyword
    | PtuMove
    | PtuNature
    | PtuPokeball
    | PtuPokemon
    | PtuStatus
    | PtuTm;

type LookupParamsFromLookupModel<PtuLookupModel extends AllPtuLookupModels> = PtuLookupModel extends PtuMove // Move
    ? GetLookupMoveDataParameters
    : PtuLookupModel extends PtuAbility // Ability
        ? GetLookupAbilityDataParameters
        : PtuLookupModel extends PtuCapability // Capability
            ? GetLookupCapabilityDataParameters
            : PtuLookupModel extends PtuEdge // Edge
                ? GetLookupEdgeDataParameters
                : PtuLookupModel extends PtuFeature // Feature
                    ? GetLookupFeatureDataParameters
                    : PtuLookupModel extends PtuKeyword // Keyword
                        ? GetLookupKeywordDataParameters
                        : PtuLookupModel extends PtuNature // Nature
                            ? GetLookupNatureDataParameters
                            : PtuLookupModel extends PtuPokeball // Pokeball
                                ? GetLookupPokeballDataParameters
                                : PtuLookupModel extends PtuPokemon // Pokemon
                                    ? GetLookupPokemonDataParameters
                                    : PtuLookupModel extends PtuStatus // Status
                                        ? GetLookupStatusDataParameters
                                        : PtuLookupModel extends PtuTm // TM
                                            ? GetLookupTmDataParameters
                                            : never;

type AllLookupParams = GetLookupMoveDataParameters
    | GetLookupAbilityDataParameters
    | GetLookupCapabilityDataParameters
    | GetLookupEdgeDataParameters
    | GetLookupFeatureDataParameters
    | GetLookupNatureDataParameters
    | GetLookupPokeballDataParameters
    | GetLookupPokemonDataParameters
    | GetLookupStatusDataParameters
    | GetLookupTmDataParameters;

interface BasePtuLookupStrategy<PtuLookupModel extends AllPtuLookupModels> extends ChatIteractionStrategy
{
    getLookupData(input?: AllLookupParams): Promise<PtuLookupModel[]>;
}

type PtuStrategyMap = StrategyMap<
    PtuSubcommandGroup,
    PtuLookupSubcommand
    | PtuQuickReferenceInfo
    | PtuRandomSubcommand
    | PtuCalculateSubcommand
    | PtuRollSubcommand
    | PtuTrainSubcommand
>;

export class PtuStrategyExecutor extends BaseStrategyExecutor
{
    private static isQueryingPokemonAutocomplete = false;
    private static strategies: PtuStrategyMap = {
        [PtuSubcommandGroup.Calculate]: calculateStrategies,
        [PtuSubcommandGroup.Lookup]: lookupStrategies,
        [PtuSubcommandGroup.QuickReference]: quickReferenceStrategies,
        [PtuSubcommandGroup.Random]: randomStrategies,
        [PtuSubcommandGroup.Roll]: rollStrategies,
        [PtuSubcommandGroup.Train]: TrainPokemonStrategy,
    };

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
        const Strategy = this.getPtuStrategy({
            subcommandGroup,
            subcommand,
            interaction,
        });

        if (Strategy)
        {
            return await Strategy.run(interaction);
        }

        return false;
    }

    // TODO: Dry this out with strategy pattern later. Make it part of PtuStrategyExecutor.
    public static async getAutocompleteChoices(focusedValue: AutocompleteFocusedOption): Promise<ApplicationCommandOptionChoiceData<string>[]>
    {
        const autocompleteName = focusedValue.name as PtuCompleteParameterName;
        let data: { name: string }[] = [];

        // Move Name
        if (autocompleteName === PtuCompleteParameterName.MoveName)
        {
            data = await PtuStrategyExecutor.getLookupData<PtuMove>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Move,
                options: { sortBy: 'name' },
            });
        }

        // Ability Name
        if (autocompleteName === PtuCompleteParameterName.AbilityName)
        {
            data = await PtuStrategyExecutor.getLookupData<PtuAbility>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Ability,
            });
        }

        // Natures
        if (autocompleteName === PtuCompleteParameterName.NatureName)
        {
            data = await PtuStrategyExecutor.getLookupData<PtuNature>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Nature,
            });
        }

        // Pokemon
        if (autocompleteName === PtuCompleteParameterName.PokemonName)
        {
            if (this.isQueryingPokemonAutocomplete)
            {
                await Timer.waitUntilTrue({
                    seconds: 0.2,
                    callback: () => !this.isQueryingPokemonAutocomplete,
                });
            }

            this.isQueryingPokemonAutocomplete = true;
            data = await PtuStrategyExecutor.getLookupData<PtuPokemon>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Pokemon,
                options: {
                    name: focusedValue.value,
                },
            });
            this.isQueryingPokemonAutocomplete = false;
        }

        // Status Name
        if (autocompleteName === PtuCompleteParameterName.StatusName)
        {
            data = await PtuStrategyExecutor.getLookupData<PtuStatus>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Status,
            });
        }

        // TM Name
        if (autocompleteName === PtuCompleteParameterName.TmName)
        {
            data = await PtuStrategyExecutor.getLookupData<PtuTm>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Tm,
            });
        }

        // Capability Name
        if (autocompleteName === PtuCompleteParameterName.CapabilityName)
        {
            data = await PtuStrategyExecutor.getLookupData<PtuCapability>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Capability,
            });
        }

        // Feature Name
        if (autocompleteName === PtuCompleteParameterName.FeatureName)
        {
            data = await PtuStrategyExecutor.getLookupData<PtuFeature>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Feature,
            });
        }

        // Edge Name
        if (autocompleteName === PtuCompleteParameterName.EdgeName)
        {
            data = await PtuStrategyExecutor.getLookupData<PtuEdge>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Edge,
            });
        }

        // Keyword Name
        if (autocompleteName === PtuCompleteParameterName.KeywordName)
        {
            data = await PtuStrategyExecutor.getLookupData<PtuKeyword>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Keyword,
            });
        }

        // Pokeball Name
        if (autocompleteName === PtuCompleteParameterName.PokeballName)
        {
            data = await PtuStrategyExecutor.getLookupData<PtuPokeball>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Pokeball,
            });
        }

        // Parse data to discord's format
        const choices = data.map<ApplicationCommandOptionChoiceData<string>>(({ name }) =>
        {
            return {
                name,
                value: name,
            };
        });

        // Get the choices matching the search
        const filteredChoices = choices.filter(choice =>
            choice.name.toLowerCase().startsWith(focusedValue.value.toLowerCase(), 0),
        );

        // Discord limits a maximum of 25 choices to display
        return filteredChoices.slice(0, MAX_AUTOCOMPLETE_CHOICES);
    }

    public static async getLookupData<PtuLookupModel extends AllPtuLookupModels>({
        subcommandGroup,
        subcommand,
        options,
    }: {
        subcommandGroup: PtuSubcommandGroup;
        subcommand: PtuLookupSubcommand | PtuRandomSubcommand;
        options?: LookupParamsFromLookupModel<PtuLookupModel>;
    }): Promise<PtuLookupModel[]>
    {
        const Strategy = super.getStrategy({
            strategies: this.strategies,
            subcommandGroup,
            subcommand,
        }) as BasePtuLookupStrategy<PtuLookupModel> | undefined;

        if (Strategy)
        {
            return await Strategy.getLookupData(options);
        }

        return [];
    }

    private static getPtuStrategy({
        subcommandGroup,
        subcommand,
        interaction,
    }: {
        subcommandGroup: PtuSubcommandGroup;
        subcommand: PtuLookupSubcommand | PtuRandomSubcommand | PtuCalculateSubcommand | PtuSubcommandGroup.QuickReference | PtuSubcommandGroup.Train;
        interaction: ChatInputCommandInteraction;
    }): ChatIteractionStrategy | undefined
    {
        let Strategy: ChatIteractionStrategy | undefined;

        if (subcommand === PtuSubcommandGroup.QuickReference)
        {
            const referenceInfo = interaction.options.getString('reference_info', true) as PtuQuickReferenceInfo;

            Strategy = super.getStrategy({
                strategies: this.strategies,
                subcommandGroup: subcommand,
                subcommand: referenceInfo,
            });
        }
        else
        {
            Strategy = super.getStrategy({
                strategies: this.strategies,
                subcommandGroup,
                subcommand,
            });
        }

        return Strategy;
    }
}
