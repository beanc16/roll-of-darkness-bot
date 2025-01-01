import { logger } from '@beanc16/logger';
import {
    ApplicationCommandOptionChoiceData,
    AutocompleteFocusedOption,
    ChatInputCommandInteraction,
} from 'discord.js';

import { MAX_AUTOCOMPLETE_CHOICES } from '../../../constants/discord.js';
import { BaseStrategyExecutor } from '../../strategies/BaseStrategyExecutor.js';
import { ChatIteractionStrategy, StrategyMap } from '../../strategies/types/ChatIteractionStrategy.js';
import { AutocompleteHandlerMap } from '../../strategies/types/types.js';
import { abilitiesForTypeEffectivenessSet } from '../constants.js';
import { PtuAbility } from '../models/PtuAbility.js';
import { PtuMove } from '../models/PtuMove.js';
import { PtuBreedSubcommand } from '../options/breed.js';
import { PtuCalculateSubcommand } from '../options/calculate.js';
import { PtuQuickReferenceInfo, PtuSubcommandGroup } from '../options/index.js';
import { PtuLookupSubcommand } from '../options/lookup.js';
import { PtuRandomSubcommand } from '../options/random.js';
import { PtuRollSubcommand } from '../options/roll.js';
import { PtuTrainSubcommand } from '../options/train.js';
import { PtuTypeEffectivenessSubcommand } from '../options/typeEffectiveness.js';
import { PtuAutocompleteParameterName } from '../types/autocomplete.js';
import { GetLookupAbilityDataParameters, GetLookupMoveDataParameters } from '../types/modelParameters.js';
import { PtuPokemon } from '../types/pokemon.js';
import { PtuBerry } from '../types/PtuBerry.js';
import { PtuCapability } from '../types/PtuCapability.js';
import { PtuEdge } from '../types/PtuEdge.js';
import { PtuEvolutionaryStone } from '../types/PtuEvolutionaryStone.js';
import { PtuFeature } from '../types/PtuFeature.js';
import { PtuHealingItem } from '../types/PtuHealingItem.js';
import { PtuHeldItem } from '../types/PtuHeldItem.js';
import { PtuKeyword } from '../types/PtuKeyword.js';
import { PtuNature } from '../types/PtuNature.js';
import { PtuPokeball } from '../types/PtuPokeball.js';
import { PtuStatus } from '../types/PtuStatus.js';
import { PtuTm } from '../types/PtuTm.js';
import { PtuVitamin } from '../types/PtuVitamin.js';
import { BreedPokemonStrategy } from './breed/BreedPokemonStrategy.js';
import calculateStrategies from './calculate/index.js';
import lookupStrategies from './lookup/index.js';
import { GetLookupCapabilityDataParameters } from './lookup/LookupCapabilityStrategy.js';
import { GetLookupEdgeDataParameters } from './lookup/LookupEdgeStrategy.js';
import { GetLookupEvolutionaryStoneDataParameters } from './lookup/LookupEvolutionaryStoneStrategy.js';
import { GetLookupFeatureDataParameters } from './lookup/LookupFeatureStrategy.js';
import { GetLookupHeldItemDataParameters } from './lookup/LookupHeldItemStrategy.js';
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
import { TypeEffectivenessStrategy } from './typeEffectiveness/TypeEffectivenessStrategy.js';

type AllPtuLookupModels = PtuAbility
    | PtuCapability
    | PtuEdge
    | PtuEvolutionaryStone
    | PtuFeature
    | PtuHeldItem
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
                : PtuLookupModel extends PtuEvolutionaryStone // Evolutionary Stone
                    ? GetLookupEvolutionaryStoneDataParameters
                    : PtuLookupModel extends PtuFeature // Feature
                        ? GetLookupFeatureDataParameters
                        : PtuLookupModel extends PtuHeldItem // Held Item
                            ? GetLookupHeldItemDataParameters
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
    | GetLookupEvolutionaryStoneDataParameters
    | GetLookupFeatureDataParameters
    | GetLookupHeldItemDataParameters
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
    | PtuBreedSubcommand
    | PtuCalculateSubcommand
    | PtuRandomSubcommand
    | PtuRollSubcommand
    | PtuTrainSubcommand
    | PtuTypeEffectivenessSubcommand
>;

export class PtuStrategyExecutor extends BaseStrategyExecutor
{
    private static strategies: PtuStrategyMap = {
        [PtuSubcommandGroup.Breed]: BreedPokemonStrategy,
        [PtuSubcommandGroup.Calculate]: calculateStrategies,
        [PtuSubcommandGroup.Lookup]: lookupStrategies,
        [PtuSubcommandGroup.QuickReference]: quickReferenceStrategies,
        [PtuSubcommandGroup.Random]: randomStrategies,
        [PtuSubcommandGroup.Roll]: rollStrategies,
        [PtuSubcommandGroup.Train]: TrainPokemonStrategy,
        [PtuSubcommandGroup.TypeEffectiveness]: TypeEffectivenessStrategy,
    };

    /* istanbul ignore next */
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

    public static async getAutocompleteChoices(focusedValue: AutocompleteFocusedOption): Promise<ApplicationCommandOptionChoiceData<string>[]>
    {
        const autocompleteName = focusedValue.name as PtuAutocompleteParameterName;

        const abilityForTypeEffectivenessHandler: () => Promise<PtuAbility[]> = async () =>
        {
            const abilities = await PtuStrategyExecutor.getLookupData<PtuAbility>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Ability,
            });

            return abilities.filter(ability =>
                abilitiesForTypeEffectivenessSet.has(ability.name),
            );
        };

        let propertyToExtract: 'name' | 'patron' = 'name';

        // Get data based on the autocompleteName
        const handlerMap: AutocompleteHandlerMap<PtuAutocompleteParameterName> = {
            [PtuAutocompleteParameterName.AbilityName]: () => PtuStrategyExecutor.getLookupData<PtuAbility>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Ability,
            }),
            [PtuAutocompleteParameterName.Ability1]: abilityForTypeEffectivenessHandler,
            [PtuAutocompleteParameterName.Ability2]: abilityForTypeEffectivenessHandler,
            [PtuAutocompleteParameterName.Ability3]: abilityForTypeEffectivenessHandler,
            [PtuAutocompleteParameterName.Ability4]: abilityForTypeEffectivenessHandler,
            [PtuAutocompleteParameterName.BerryName]: () => PtuStrategyExecutor.getLookupData<PtuBerry>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Berry,
            }),
            [PtuAutocompleteParameterName.CapabilityName]: () => PtuStrategyExecutor.getLookupData<PtuCapability>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Capability,
            }),
            [PtuAutocompleteParameterName.EdgeName]: () => PtuStrategyExecutor.getLookupData<PtuEdge>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Edge,
            }),
            [PtuAutocompleteParameterName.EvolutionaryStone]: () => PtuStrategyExecutor.getLookupData<PtuEvolutionaryStone>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.EvolutionaryStone,
            }),
            [PtuAutocompleteParameterName.FeatureName]: () => PtuStrategyExecutor.getLookupData<PtuFeature>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Feature,
            }),
            [PtuAutocompleteParameterName.FemaleSpecies]: () => PtuStrategyExecutor.getLookupData<PtuFeature>({
                subcommandGroup: PtuSubcommandGroup.Breed,
                subcommand: PtuBreedSubcommand.Breed,
            }),
            [PtuAutocompleteParameterName.GiftBlessingName]: () => PtuStrategyExecutor.getLookupData<PtuHealingItem>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.GiftBlessing,
            }),
            [PtuAutocompleteParameterName.GiftBlessingPatron]: () =>
            {
                propertyToExtract = 'patron';
                return PtuStrategyExecutor.getLookupData<PtuHealingItem>({
                    subcommandGroup: PtuSubcommandGroup.Lookup,
                    subcommand: PtuLookupSubcommand.GiftBlessing,
                });
            },
            [PtuAutocompleteParameterName.HealingItem]: () => PtuStrategyExecutor.getLookupData<PtuHealingItem>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.HealingItem,
            }),
            [PtuAutocompleteParameterName.HeldItem]: () => PtuStrategyExecutor.getLookupData<PtuHeldItem>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.HeldItem,
            }),
            [PtuAutocompleteParameterName.KeywordName]: () => PtuStrategyExecutor.getLookupData<PtuKeyword>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Keyword,
            }),
            [PtuAutocompleteParameterName.MaleSpecies]: () => PtuStrategyExecutor.getLookupData<PtuFeature>({
                subcommandGroup: PtuSubcommandGroup.Breed,
                subcommand: PtuBreedSubcommand.Breed,
            }),
            [PtuAutocompleteParameterName.MoveName]: () => PtuStrategyExecutor.getLookupData<PtuMove>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Move,
                options: { sortBy: 'name' },
            }),
            [PtuAutocompleteParameterName.NatureName]: () => PtuStrategyExecutor.getLookupData<PtuNature>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Nature,
            }),
            [PtuAutocompleteParameterName.PokeballName]: () => PtuStrategyExecutor.getLookupData<PtuPokeball>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Pokeball,
            }),
            [PtuAutocompleteParameterName.PokemonToEvolve]: async () =>
            {
                const evolutionaryStones = await PtuStrategyExecutor.getLookupData<PtuEvolutionaryStone>({
                    subcommandGroup: PtuSubcommandGroup.Lookup,
                    subcommand: PtuLookupSubcommand.EvolutionaryStone,
                });

                // Set the unique names of the pokemon that can evolve
                const set = evolutionaryStones.reduce<Set<string>>((
                    acc,
                    { pokemonToEvolve = [] },
                ) =>
                {
                    pokemonToEvolve.forEach(pokemonName =>
                        acc.add(pokemonName),
                    );
                    return acc;
                }, new Set());

                // Convert to the desired output
                const output: { name: string }[] = [];
                set.forEach(pokemonName => output.push({ name: pokemonName }));
                output.sort((a, b) => a.name.localeCompare(b.name));
                return output;
            },
            [PtuAutocompleteParameterName.StatusName]: () => PtuStrategyExecutor.getLookupData<PtuStatus>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Status,
            }),
            [PtuAutocompleteParameterName.TmName]: () => PtuStrategyExecutor.getLookupData<PtuTm>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Tm,
            }),
            [PtuAutocompleteParameterName.VitaminName]: () => PtuStrategyExecutor.getLookupData<PtuVitamin>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Vitamin,
            }),
            [PtuAutocompleteParameterName.XItemName]: () => PtuStrategyExecutor.getLookupData<PtuVitamin>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.XItem,
            }),
            [PtuAutocompleteParameterName.PokemonName]: async () =>
            {
                const output = await PtuStrategyExecutor.getLookupData<PtuPokemon>({
                    subcommandGroup: PtuSubcommandGroup.Lookup,
                    subcommand: PtuLookupSubcommand.Pokemon,
                    options: {
                        name: focusedValue.value,
                    },
                });

                return output;
            },
        };

        const data = await handlerMap[autocompleteName]();

        // Handle enums not being set properly
        if (!data)
        {
            logger.error(`Failed to get autocomplete data. Ensure that all enums and handlers are set up as intended in ${this.name}`, { autocompleteName });
            return [];
        }

        // Get only unique values
        const choiceValues = data.reduce<Set<string>>((acc, element) =>
        {
            acc.add(element[propertyToExtract] ?? element.name);
            return acc;
        }, new Set());

        // Parse data to discord's format
        const choices = [...choiceValues].sort().map<ApplicationCommandOptionChoiceData<string>>((value) =>
        {
            return {
                name: value,
                value,
            };
        });

        // Get the choices matching the search
        const filteredChoices = choices.filter(choice =>
            choice.name.toLowerCase().startsWith(focusedValue.value.toLowerCase(), 0),
        );

        // Discord limits a maximum of 25 choices to display
        return filteredChoices.slice(0, MAX_AUTOCOMPLETE_CHOICES);
    }

    /* istanbul ignore next */
    public static async getLookupData<PtuLookupModel extends AllPtuLookupModels>({
        subcommandGroup,
        subcommand,
        options,
    }: {
        subcommandGroup: PtuSubcommandGroup;
        subcommand: PtuLookupSubcommand | PtuRandomSubcommand | PtuBreedSubcommand;
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

    /* istanbul ignore next */
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
