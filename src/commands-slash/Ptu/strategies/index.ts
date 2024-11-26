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
import { GetLookupAbilityDataParameters, GetLookupMoveDataParameters } from '../types/modelParameters.js';
import { PtuPokemon } from '../types/pokemon.js';
import { PtuCapability } from '../types/PtuCapability.js';
import { PtuEdge } from '../types/PtuEdge.js';
import { PtuFeature } from '../types/PtuFeature.js';
import { PtuKeyword } from '../types/PtuKeyword.js';
import { PtuNature } from '../types/PtuNature.js';
import { PtuStatus } from '../types/PtuStatus.js';
import { PtuTm } from '../types/PtuTm.js';
import calculateStrategies from './calculate/index.js';
import lookupStrategies from './lookup/index.js';
import { GetLookupCapabilityDataParameters } from './lookup/LookupCapabilityStrategy.js';
import { GetLookupEdgeDataParameters } from './lookup/LookupEdgeStrategy.js';
import { GetLookupFeatureDataParameters } from './lookup/LookupFeatureStrategy.js';
import { GetLookupNatureDataParameters } from './lookup/LookupNatureStrategy.js';
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
                    : PtuLookupModel extends PtuNature // Nature
                        ? GetLookupNatureDataParameters
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
        let choices: ApplicationCommandOptionChoiceData<string>[] = [];

        // Move Name
        if (focusedValue.name === 'move_name')
        {
            const moves = await PtuStrategyExecutor.getLookupData<PtuMove>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Move,
                options: { sortBy: 'name' },
            });
            choices = moves.map<ApplicationCommandOptionChoiceData<string>>(({ name }) => {
                return {
                    name,
                    value: name,
                };
            });
        }

        // Ability Name
        if (focusedValue.name === 'ability_name')
        {
            const abilities = await PtuStrategyExecutor.getLookupData<PtuAbility>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Ability,
            });
            choices = abilities.map<ApplicationCommandOptionChoiceData<string>>(({ name }) => {
                return {
                    name,
                    value: name,
                };
            });
        }

        // Natures
        if (focusedValue.name === 'nature_name')
        {
            const natures = await PtuStrategyExecutor.getLookupData<PtuNature>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Nature,
            });
            choices = natures.map<ApplicationCommandOptionChoiceData<string>>(({ name }) => {
                return {
                    name,
                    value: name,
                };
            });
        }

        // Pokemon
        if (focusedValue.name === 'pokemon_name')
        {
            if (this.isQueryingPokemonAutocomplete)
            {
                await Timer.waitUntilTrue({
                    seconds: 0.2,
                    callback: () => !this.isQueryingPokemonAutocomplete,
                });
            }

            this.isQueryingPokemonAutocomplete = true;
            const pokemon = await PtuStrategyExecutor.getLookupData<PtuPokemon>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Pokemon,
                options: {
                    name: focusedValue.value,
                },
            });
            choices = pokemon.map<ApplicationCommandOptionChoiceData<string>>(({ name }) => {
                return {
                    name,
                    value: name,
                };
            });
            this.isQueryingPokemonAutocomplete = false;
        }

        // Status Name
        if (focusedValue.name === 'status_name')
        {
            const statuses = await PtuStrategyExecutor.getLookupData<PtuStatus>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Status,
            });
            choices = statuses.map<ApplicationCommandOptionChoiceData<string>>(({ name }) => {
                return {
                    name,
                    value: name,
                };
            });
        }

        // TM Name
        if (focusedValue.name === 'tm_name')
        {
            const tms = await PtuStrategyExecutor.getLookupData<PtuTm>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Tm,
            });
            choices = tms.map<ApplicationCommandOptionChoiceData<string>>(({ name }) => {
                return {
                    name,
                    value: name,
                };
            });
        }

        // Capability Name
        if (focusedValue.name === 'capability_name')
        {
            const capabilities = await PtuStrategyExecutor.getLookupData<PtuCapability>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Capability,
            });
            choices = capabilities.map<ApplicationCommandOptionChoiceData<string>>(({ name }) => {
                return {
                    name,
                    value: name,
                };
            });
        }

        // Feature Name
        if (focusedValue.name === 'feature_name')
        {
            const features = await PtuStrategyExecutor.getLookupData<PtuFeature>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Feature,
            });
            choices = features.map<ApplicationCommandOptionChoiceData<string>>(({ name }) => {
                return {
                    name,
                    value: name,
                };
            });
        }

        // Edge Name
        if (focusedValue.name === 'edge_name')
        {
            const edges = await PtuStrategyExecutor.getLookupData<PtuEdge>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Edge,
            });
            choices = edges.map<ApplicationCommandOptionChoiceData<string>>(({ name }) => {
                return {
                    name,
                    value: name,
                };
            });
        }

        // Keyword Name
        if (focusedValue.name === 'keyword_name')
        {
            const keywords = await PtuStrategyExecutor.getLookupData<PtuKeyword>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Keyword,
            });
            choices = keywords.map<ApplicationCommandOptionChoiceData<string>>(({ name }) => {
                return {
                    name,
                    value: name,
                };
            });
        }

        // Get the choices matching the search
		const filteredChoices = choices.filter((choice) =>
            choice.name.toLowerCase().startsWith(focusedValue.value.toLowerCase(), 0)
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
