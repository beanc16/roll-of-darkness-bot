import { logger } from '@beanc16/logger';
import {
    ApplicationCommandOptionChoiceData,
    AutocompleteFocusedOption,
    ButtonInteraction,
    ChatInputCommandInteraction,
    Message,
    StringSelectMenuInteraction,
} from 'discord.js';

import { MAX_AUTOCOMPLETE_CHOICES } from '../../../constants/discord.js';
import { BaseStrategyExecutor } from '../../strategies/BaseStrategyExecutor/BaseStrategyExecutor.js';
import { AutocompleteHandlerMap } from '../../strategies/types/types.js';
import { abilitiesForTypeEffectivenessSet } from '../constants.js';
import { PtuFakemonPseudoCache } from '../dal/PtuFakemonPseudoCache.js';
import { PtuAbility } from '../models/PtuAbility.js';
import { PtuAura } from '../models/PtuAura.js';
import { PtuMove } from '../models/PtuMove.js';
import { PtuBreedSubcommand } from '../options/breed.js';
import { PtuCalculateSubcommand } from '../options/calculate.js';
import { PtuFakemonSubcommand } from '../options/fakemon.js';
import { PtuGenerateSubcommand } from '../options/generate.js';
import { PtuQuickReferenceInfo, PtuSubcommandGroup } from '../options/index.js';
import { PtuLookupSubcommand } from '../options/lookup.js';
import { PtuRandomSubcommand } from '../options/random.js';
import { PtuAutocompleteParameterName } from '../types/autocomplete.js';
import { GetLookupAbilityDataParameters, GetLookupMoveDataParameters } from '../types/modelParameters.js';
import { PtuPokemon } from '../types/pokemon.js';
import { PtuBerry } from '../types/PtuBerry.js';
import { PtuCapability } from '../types/PtuCapability.js';
import { PtuEdge } from '../types/PtuEdge.js';
import { PtuEvolutionaryStone } from '../types/PtuEvolutionaryStone.js';
import { PtuFeature } from '../types/PtuFeature.js';
import { PtuHazard } from '../types/PtuHazard.js';
import { PtuHealingItem } from '../types/PtuHealingItem.js';
import { PtuHeldItem } from '../types/PtuHeldItem.js';
import { PtuKeyword } from '../types/PtuKeyword.js';
import { PtuNature } from '../types/PtuNature.js';
import { PtuPokeball } from '../types/PtuPokeball.js';
import { PtuStatus } from '../types/PtuStatus.js';
import { PtuTerrain } from '../types/PtuTerrain.js';
import { PtuTm } from '../types/PtuTm.js';
import { PtuVitamin } from '../types/PtuVitamin.js';
import {
    PtuButtonIteractionStrategy,
    PtuChatIteractionStrategy,
    PtuStrategyMap,
    PtuStringSelectMenuIteractionStrategy,
} from '../types/strategies.js';
import { BreedPokemonStrategy } from './breed/BreedPokemonStrategy.js';
import calculateStrategies from './calculate/index.js';
import fakemonStrategies from './fakemon/index.js';
import gameStrategies from './game/index.js';
import generateStrategies from './generate/index.js';
import lookupStrategies from './lookup/index.js';
import { GetLookupAuraDataParameters } from './lookup/LookupAuraStrategy.js';
import { GetLookupBerryDataParameters } from './lookup/LookupBerryStrategy.js';
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
import { MetadataPokemonStrategy } from './metadata/MetadataPokemonStrategy.js';
import quickReferenceStrategies from './quickReference/index.js';
import randomStrategies from './random/index.js';
import rollStrategies from './roll/index.js';
import { TrainPokemonStrategy } from './train/TrainPokemonStrategy.js';
import { TypeEffectivenessStrategy } from './typeEffectiveness/TypeEffectivenessStrategy.js';

type AllPtuLookupModels = PtuAbility
    | PtuAura
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
        : PtuLookupModel extends PtuAura // Aura
            ? GetLookupAuraDataParameters
            : PtuLookupModel extends PtuBerry // Berry
                ? GetLookupBerryDataParameters
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
    | GetLookupAuraDataParameters
    | GetLookupBerryDataParameters
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

interface BasePtuLookupStrategy<PtuLookupModel extends AllPtuLookupModels> extends PtuChatIteractionStrategy
{
    getLookupData(input?: AllLookupParams): Promise<PtuLookupModel[]>;
}

export class PtuStrategyExecutor extends BaseStrategyExecutor
{
    private static strategies: PtuStrategyMap = {
        [PtuSubcommandGroup.Breed]: BreedPokemonStrategy,
        [PtuSubcommandGroup.Calculate]: calculateStrategies,
        [PtuSubcommandGroup.Fakemon]: fakemonStrategies,
        [PtuSubcommandGroup.Game]: gameStrategies,
        [PtuSubcommandGroup.Generate]: generateStrategies,
        [PtuSubcommandGroup.Lookup]: lookupStrategies,
        [PtuSubcommandGroup.Metadata]: MetadataPokemonStrategy,
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
        subcommand: PtuLookupSubcommand | PtuRandomSubcommand | PtuCalculateSubcommand | PtuGenerateSubcommand | PtuSubcommandGroup.QuickReference | PtuSubcommandGroup.Train;
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
            return await Strategy.run(interaction, this.strategies);
        }

        return false;
    }

    /* istanbul ignore next */
    public static async runStringSelect({
        interaction,
        message,
        commandName,
        subcommandGroup,
        subcommand,
    }: {
        interaction: StringSelectMenuInteraction;
        message: Message;
        commandName: string;
        subcommandGroup: PtuSubcommandGroup;
        subcommand: PtuFakemonSubcommand;
    }): Promise<boolean>
    {
        const Strategy = this.getPtuStrategy({
            subcommandGroup,
            subcommand,
            interaction,
        });

        if (Strategy && Strategy.runStringSelect)
        {
            return await Strategy.runStringSelect(interaction, this.strategies, {
                message,
                commandName,
                subcommandGroup,
                subcommand,
            });
        }

        return false;
    }

    /* istanbul ignore next */
    public static async runButton({
        interaction,
        message,
        commandName,
        subcommandGroup,
        subcommand,
    }: {
        interaction: ButtonInteraction;
        message: Message;
        commandName: string;
        subcommandGroup: PtuSubcommandGroup;
        subcommand: PtuFakemonSubcommand;
    }): Promise<boolean>
    {
        const Strategy = this.getPtuStrategy({
            subcommandGroup,
            subcommand,
            interaction,
        });

        if (Strategy && Strategy.runButton)
        {
            return await Strategy.runButton(interaction, this.strategies, {
                message,
                commandName,
                subcommandGroup,
                subcommand,
            });
        }
        if (Strategy && !Strategy.runButton)
        {
            // Treat this as that strategy not having runButton implemented
            // due to in-line event handling
            return true;
        }

        return false;
    }

    public static async getAutocompleteChoices(
        focusedValue: AutocompleteFocusedOption,
        userId: string,
    ): Promise<ApplicationCommandOptionChoiceData<string>[]>
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

        let propertyToExtract: 'name' | 'patron' | 'breedingInformation.eggGroups' = 'name';

        // Get data based on the autocompleteName
        const handlerMap: AutocompleteHandlerMap<PtuAutocompleteParameterName> = {
            [PtuAutocompleteParameterName.AbilityName]: () => PtuStrategyExecutor.getLookupData<PtuAbility>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Ability,
            }),
            [PtuAutocompleteParameterName.Ability1]: abilityForTypeEffectivenessHandler,
            [PtuAutocompleteParameterName.Ability2]: abilityForTypeEffectivenessHandler,
            [PtuAutocompleteParameterName.Ability3]: abilityForTypeEffectivenessHandler,
            [PtuAutocompleteParameterName.AuraName]: () => PtuStrategyExecutor.getLookupData<PtuAura>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Aura,
            }),
            [PtuAutocompleteParameterName.AuraUserName]: () => PtuStrategyExecutor.getLookupData<PtuAura>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Aura,
                options: { includeAllIfNoName: true, returnLegendaryNames: true },
            }),
            [PtuAutocompleteParameterName.BaseAbilitiesOn]: async () =>
            {
                const [pokemon, fakemon] = await Promise.all([
                    PtuStrategyExecutor.getLookupData<PtuPokemon>({
                        subcommandGroup: PtuSubcommandGroup.Lookup,
                        subcommand: PtuLookupSubcommand.Pokemon,
                        options: {
                            names: [focusedValue.value],
                        },
                    }),
                    PtuFakemonPseudoCache.getAll(userId),
                ]);

                return [
                    ...pokemon,
                    ...fakemon,
                ];
            },
            [PtuAutocompleteParameterName.BaseMovesOn]: async () =>
            {
                const [pokemon, fakemon] = await Promise.all([
                    PtuStrategyExecutor.getLookupData<PtuPokemon>({
                        subcommandGroup: PtuSubcommandGroup.Lookup,
                        subcommand: PtuLookupSubcommand.Pokemon,
                        options: {
                            names: [focusedValue.value],
                        },
                    }),
                    PtuFakemonPseudoCache.getAll(userId),
                ]);

                return [
                    ...pokemon,
                    ...fakemon,
                ];
            },
            [PtuAutocompleteParameterName.BaseSpeciesOn]: async () =>
            {
                const [pokemon, fakemon] = await Promise.all([
                    PtuStrategyExecutor.getLookupData<PtuPokemon>({
                        subcommandGroup: PtuSubcommandGroup.Lookup,
                        subcommand: PtuLookupSubcommand.Pokemon,
                        options: {
                            names: [focusedValue.value],
                        },
                    }),
                    PtuFakemonPseudoCache.getAll(userId),
                ]);

                return [
                    ...pokemon,
                    ...fakemon,
                ];
            },
            [PtuAutocompleteParameterName.BasedOnAbility]: () => PtuStrategyExecutor.getLookupData<PtuMove>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Ability,
                options: { sortBy: 'name' },
            }),
            [PtuAutocompleteParameterName.BasedOnMove]: () => PtuStrategyExecutor.getLookupData<PtuMove>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Move,
                options: { sortBy: 'name' },
            }),
            [PtuAutocompleteParameterName.BerryName]: () => PtuStrategyExecutor.getLookupData<PtuBerry>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Berry,
            }),
            [PtuAutocompleteParameterName.CapabilityName]: () => PtuStrategyExecutor.getLookupData<PtuCapability>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Capability,
            }),
            [PtuAutocompleteParameterName.ClassName1]: async () =>
            {
                const nestedFeatures = await PtuStrategyExecutor.getLookupData<PtuFeature>({
                    subcommandGroup: PtuSubcommandGroup.Lookup,
                    subcommand: PtuLookupSubcommand.Class,
                }) as unknown as PtuFeature[][];

                return nestedFeatures.reduce((acc, features) =>
                {
                    features.forEach(feature => acc.push(feature));
                    return acc;
                }, []);
            },
            [PtuAutocompleteParameterName.ClassName2]: async () =>
            {
                const nestedFeatures = await PtuStrategyExecutor.getLookupData<PtuFeature>({
                    subcommandGroup: PtuSubcommandGroup.Lookup,
                    subcommand: PtuLookupSubcommand.Class,
                }) as unknown as PtuFeature[][];

                return nestedFeatures.reduce((acc, features) =>
                {
                    features.forEach(feature => acc.push(feature));
                    return acc;
                }, []);
            },
            [PtuAutocompleteParameterName.ClassName3]: async () =>
            {
                const nestedFeatures = await PtuStrategyExecutor.getLookupData<PtuFeature>({
                    subcommandGroup: PtuSubcommandGroup.Lookup,
                    subcommand: PtuLookupSubcommand.Class,
                }) as unknown as PtuFeature[][];

                return nestedFeatures.reduce((acc, features) =>
                {
                    features.forEach(feature => acc.push(feature));
                    return acc;
                }, []);
            },
            [PtuAutocompleteParameterName.ClassName4]: async () =>
            {
                const nestedFeatures = await PtuStrategyExecutor.getLookupData<PtuFeature>({
                    subcommandGroup: PtuSubcommandGroup.Lookup,
                    subcommand: PtuLookupSubcommand.Class,
                }) as unknown as PtuFeature[][];

                return nestedFeatures.reduce((acc, features) =>
                {
                    features.forEach(feature => acc.push(feature));
                    return acc;
                }, []);
            },
            [PtuAutocompleteParameterName.EdgeName]: () => PtuStrategyExecutor.getLookupData<PtuEdge>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Edge,
            }),
            [PtuAutocompleteParameterName.EggGroup1]: () =>
            {
                propertyToExtract = 'breedingInformation.eggGroups';
                return PtuStrategyExecutor.getLookupData({
                    subcommandGroup: PtuSubcommandGroup.Breed,
                    subcommand: PtuBreedSubcommand.Breed,
                });
            },
            [PtuAutocompleteParameterName.EggGroup2]: () =>
            {
                propertyToExtract = 'breedingInformation.eggGroups';
                return PtuStrategyExecutor.getLookupData({
                    subcommandGroup: PtuSubcommandGroup.Breed,
                    subcommand: PtuBreedSubcommand.Breed,
                });
            },
            [PtuAutocompleteParameterName.EquipmentName]: () => PtuStrategyExecutor.getLookupData<PtuEdge>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Equipment,
            }),
            [PtuAutocompleteParameterName.EvolutionaryStone]: () => PtuStrategyExecutor.getLookupData<PtuEvolutionaryStone>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.EvolutionaryStone,
            }),
            [PtuAutocompleteParameterName.FakemonSpeciesName]: () => PtuFakemonPseudoCache.getAll(userId),
            [PtuAutocompleteParameterName.FeatureName]: () => PtuStrategyExecutor.getLookupData<PtuFeature>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Feature,
            }),
            [PtuAutocompleteParameterName.FemaleSpecies]: () => PtuStrategyExecutor.getLookupData({
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
            [PtuAutocompleteParameterName.HazardName]: () => PtuStrategyExecutor.getLookupData<PtuHazard>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Hazard,
            }),
            [PtuAutocompleteParameterName.HealingItem]: () => PtuStrategyExecutor.getLookupData<PtuHealingItem>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.HealingItem,
            }),
            [PtuAutocompleteParameterName.HeldItem]: () => PtuStrategyExecutor.getLookupData<PtuHeldItem>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.HeldItem,
            }),
            [PtuAutocompleteParameterName.KeyItemName]: () => PtuStrategyExecutor.getLookupData<PtuHeldItem>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.KeyItem,
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
            [PtuAutocompleteParameterName.PokemonName]: () => PtuStrategyExecutor.getLookupData<PtuPokemon>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Pokemon,
                options: {
                    names: [focusedValue.value],
                },
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
            [PtuAutocompleteParameterName.TagName]: () => PtuStrategyExecutor.getLookupData<PtuTm>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Tag,
            }),
            [PtuAutocompleteParameterName.TerrainName]: () => PtuStrategyExecutor.getLookupData<PtuTerrain>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Terrain,
            }),
            [PtuAutocompleteParameterName.TmName]: () => PtuStrategyExecutor.getLookupData<PtuTm>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Tm,
            }),
            [PtuAutocompleteParameterName.VitaminName]: () => PtuStrategyExecutor.getLookupData<PtuVitamin>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Vitamin,
            }),
            [PtuAutocompleteParameterName.WeatherName]: () => PtuStrategyExecutor.getLookupData<PtuVitamin>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Weather,
            }),
            [PtuAutocompleteParameterName.XItemName]: () => PtuStrategyExecutor.getLookupData<PtuVitamin>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.XItem,
            }),
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
            /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
            if (propertyToExtract.includes('.'))
            {
                const properties = propertyToExtract.split('.');

                // Traverse the object down to the expected value
                let currentElement = element;
                // eslint-disable-next-line no-restricted-syntax
                for (const property of properties)
                {
                    // @ts-expect-error -- TypeScript doesn't recognize the deep object traversal
                    currentElement = currentElement[property];
                }

                if (Array.isArray(currentElement))
                {
                    currentElement.forEach(value => acc.add(value as string));
                    return acc;
                }

                // @ts-expect-error -- TypeScript doesn't recognize the deep object traversal
                acc.add(currentElement ?? element.name);
                return acc;
            }

            // @ts-expect-error -- TypeScript doesn't recognize the deep object traversal
            acc.add(element[propertyToExtract] ?? element.name);
            return acc;

            /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
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
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any -- This is an extended-ish version of the original, but TS doesn't recognize it as such
            strategies: this.strategies as any,
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
        subcommand: PtuLookupSubcommand | PtuRandomSubcommand | PtuCalculateSubcommand | PtuGenerateSubcommand | PtuSubcommandGroup.QuickReference | PtuSubcommandGroup.Train | PtuFakemonSubcommand;
        interaction: ChatInputCommandInteraction;
    }): PtuChatIteractionStrategy | undefined;
    private static getPtuStrategy({
        subcommandGroup,
        subcommand,
        interaction,
    }: {
        subcommandGroup: PtuSubcommandGroup;
        subcommand: PtuLookupSubcommand | PtuRandomSubcommand | PtuCalculateSubcommand | PtuGenerateSubcommand | PtuSubcommandGroup.QuickReference | PtuSubcommandGroup.Train | PtuFakemonSubcommand;
        interaction: StringSelectMenuInteraction;
    }): PtuStringSelectMenuIteractionStrategy | undefined;
    private static getPtuStrategy({
        subcommandGroup,
        subcommand,
        interaction,
    }: {
        subcommandGroup: PtuSubcommandGroup;
        subcommand: PtuLookupSubcommand | PtuRandomSubcommand | PtuCalculateSubcommand | PtuGenerateSubcommand | PtuSubcommandGroup.QuickReference | PtuSubcommandGroup.Train | PtuFakemonSubcommand;
        interaction: ButtonInteraction;
    }): PtuButtonIteractionStrategy | undefined;
    /* istanbul ignore next */
    private static getPtuStrategy({
        subcommandGroup,
        subcommand,
        interaction,
    }: {
        subcommandGroup: PtuSubcommandGroup;
        subcommand: PtuLookupSubcommand | PtuRandomSubcommand | PtuCalculateSubcommand | PtuGenerateSubcommand | PtuSubcommandGroup.QuickReference | PtuSubcommandGroup.Train | PtuFakemonSubcommand;
        interaction: ChatInputCommandInteraction | StringSelectMenuInteraction | ButtonInteraction;
    }): PtuChatIteractionStrategy | PtuStringSelectMenuIteractionStrategy | PtuButtonIteractionStrategy | undefined
    {
        let Strategy: PtuChatIteractionStrategy | undefined;

        if (subcommand === PtuSubcommandGroup.QuickReference && 'options' in interaction)
        {
            const referenceInfo = interaction.options.getString('reference_info', true) as PtuQuickReferenceInfo;

            Strategy = super.getStrategy({
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any -- This is an extended-ish version of the original, but TS doesn't recognize it as such
                strategies: this.strategies as any,
                subcommandGroup: subcommand,
                subcommand: referenceInfo,
            });
        }
        else if (subcommandGroup?.includes(PtuSubcommandGroup.Lookup))
        {
            for (let index = 1; index <= 2; index += 1)
            {
                Strategy = super.getStrategy({
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any -- This is an extended-ish version of the original, but TS doesn't recognize it as such
                    strategies: this.strategies as any,
                    subcommandGroup: PtuSubcommandGroup.Lookup,
                    subcommand,
                });
            }
        }
        else
        {
            Strategy = super.getStrategy({
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any -- This is an extended-ish version of the original, but TS doesn't recognize it as such
                strategies: this.strategies as any,
                subcommandGroup,
                subcommand,
            });
        }

        return Strategy;
    }
}
