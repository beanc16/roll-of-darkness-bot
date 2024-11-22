import { ApplicationCommandOptionChoiceData, AutocompleteFocusedOption, ChatInputCommandInteraction } from 'discord.js';

import { PtuQuickReferenceInfo, PtuSubcommandGroup } from '../subcommand-groups/index.js';
import { PtuCalculateSubcommand } from '../subcommand-groups/calculate.js';
import { PtuLookupSubcommand } from '../subcommand-groups/lookup.js';
import { PtuRandomSubcommand } from '../subcommand-groups/random.js';
import { PtuRollSubcommand } from '../subcommand-groups/roll.js';
import { NestedChatIteractionStrategyRecord } from '../../strategies/types/ChatIteractionStrategy.js';

import calculateStrategies from './calculate/index.js';
import lookupStrategies from './lookup/index.js';
import quickReferenceStrategies from './quickReference/index.js';
import randomStrategies from './random/index.js';
import rollStrategies from './roll/index.js';

import { PtuAbility } from '../models/PtuAbility.js';
import { PtuCapability } from '../types/PtuCapability.js';
import { PtuMove } from '../models/PtuMove.js';
import { PtuNature } from '../types/PtuNature.js';
import { PtuPokemon } from '../types/pokemon.js';
import { PtuStatus } from '../types/PtuStatus.js';
import { PtuTm } from '../types/PtuTm.js';

import { GetLookupMoveDataParameters } from './lookup/LookupMoveStrategy.js';
import { GetLookupAbilityDataParameters } from './lookup/LookupAbilityStrategy.js';
import { GetLookupCapabilityDataParameters } from './lookup/LookupCapabilityStrategy.js';
import { GetLookupTmDataParameters } from './lookup/LookupTmStrategy.js';
import { GetLookupNatureDataParameters } from './lookup/LookupNatureStrategy.js';
import { GetLookupPokemonDataParameters } from './lookup/LookupPokemonStrategy.js';
import { GetLookupStatusDataParameters } from './lookup/LookupStatusStrategy.js';
import { TrainPokemonStrategy } from './train/TrainPokemonStrategy.js';
import { PtuEdge } from '../types/PtuEdge.js';
import { GetLookupEdgeDataParameters } from './lookup/LookupEdgeStrategy.js';
import { PtuFeature } from '../types/PtuFeature.js';
import { GetLookupFeatureDataParameters } from './lookup/LookupFeatureStrategy.js';
import { PtuKeyword } from '../types/PtuKeyword.js';
import { GetLookupKeywordDataParameters } from './lookup/LookupKeywordStrategy.js';
import { MAX_AUTOCOMPLETE_CHOICES } from '../../../constants/discord.js';
import { Timer } from '../../../services/Timer.js';

export class PtuStrategyExecutor
{
    // TODO: Remove this later when migrated to ptu microservice
    private static isQueryingPokemonAutocomplete = false;

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

    public static async getLookupData<PtuLookupModel extends PtuAbility | PtuCapability | PtuEdge | PtuFeature | PtuKeyword | PtuMove | PtuNature | PtuPokemon | PtuStatus | PtuTm>({
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
            : PtuLookupModel extends PtuEdge        // Edge
            ? GetLookupEdgeDataParameters
            : PtuLookupModel extends PtuFeature     // Feature
            ? GetLookupKeywordDataParameters
            : PtuLookupModel extends PtuKeyword      // Keyword
            ? GetLookupFeatureDataParameters
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
