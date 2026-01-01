import { Text } from '@beanc16/discordjs-helpers';
import {
    Attachment,
    ButtonInteraction,
    ChatInputCommandInteraction,
    StringSelectMenuInteraction,
    User,
} from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { BaseCustomModal } from '../../../../modals/BaseCustomModal.js';
import { DiscordUserId } from '../../../../types/discord.js';
import { FakemonBIEditAbilitiesStringSelectElementOptions } from '../../components/fakemon/actionRowBuilders/basicInformation/FakemonBIEditAbilitiesStringSelectActionRowBuilder.js';
import { FakemonBasicInformationStringSelectCustomIds } from '../../components/fakemon/actionRowBuilders/basicInformation/types.js';
import { FakemonBreedingInformationStringSelectCustomIds } from '../../components/fakemon/actionRowBuilders/breedingInformation/types.js';
import { FakemonCapabilitiesEditCapabilitiesStringSelectElementOptions } from '../../components/fakemon/actionRowBuilders/capabilities/FakemonCapabilitiesEditCapabilitiesStringSelectActionRowBuilder.js';
import { FakemonCapabilitiesStringSelectCustomIds } from '../../components/fakemon/actionRowBuilders/capabilities/types.js';
import { FakemonEnvironmentStringSelectCustomIds } from '../../components/fakemon/actionRowBuilders/environment/types.js';
import { FakemonOverviewStringSelectCustomIds } from '../../components/fakemon/actionRowBuilders/FakemonOverviewActionRowBuilder.js';
import { FakemonSIEditSizeStringSelectElementOptions, FakemonSizeInformationStringSelectCustomIds } from '../../components/fakemon/actionRowBuilders/FakemonSIEditSizeStringSelectActionRowBuilder.js';
import { FakemonSkillsEditStringSelectElementOptions, FakemonSkillsStringSelectCustomIds } from '../../components/fakemon/actionRowBuilders/FakemonSkillsEditStringSelectActionRowBuilder.js';
import { FakemonStatsEditStringSelectElementOptions } from '../../components/fakemon/actionRowBuilders/stats/FakemonStatsEditStringSelectActionRowBuilder.js';
import { FakemonStatsSwapStringSelectElementOptions } from '../../components/fakemon/actionRowBuilders/stats/FakemonStatsSwapStringSelectActionRowBuilder.js';
import { FakemonStatsStringSelectCustomIds } from '../../components/fakemon/actionRowBuilders/stats/types.js';
import { PtuFakemonCollection, PtuFakemonStatus } from '../../dal/models/PtuFakemonCollection.js';
import { PtuFakemonPseudoCache, PtuFakemonToCreate } from '../../dal/PtuFakemonPseudoCache.js';
import { PtuPokemonForLookupPokemon } from '../../embed-messages/lookup.js';
import { FakemonAbilityEditingModal1 } from '../../modals/fakemon/abilities/FakemonAbilityEditingModal1.js';
import { FakemonAbilityEditingModal2 } from '../../modals/fakemon/abilities/FakemonAbilityEditingModal2.js';
import { FakemonNonOtherCapabilityEditingModal1 } from '../../modals/fakemon/capabilities/FakemonNonOtherCapabilityEditingModal1.js';
import { FakemonNonOtherCapabilityEditingModal2 } from '../../modals/fakemon/capabilities/FakemonNonOtherCapabilityEditingModal2.js';
import { FakemonOtherCapabilityAddingModal } from '../../modals/fakemon/capabilities/FakemonOtherCapabilityAddingModal.js';
import { FakemonSkillEditingModal } from '../../modals/fakemon/FakemonSkillEditingModal.js';
import { FakemonStatEditingModal } from '../../modals/fakemon/FakemonStatEditingModal.js';
import { FakemonSIHeightEditingModal } from '../../modals/fakemon/sizeInformation/FakemonSIHeightEditingModal.js';
import { FakemonSIWeightEditingModal } from '../../modals/fakemon/sizeInformation/FakemonSIWeightEditingModal.js';
import { PtuFakemonSubcommand } from '../../options/fakemon.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import { PtuLookupSubcommand } from '../../options/lookup.js';
import { FakemonBasicInformationManagerService } from '../../services/FakemonDataManagers/FakemonBasicInformationManagerService.js';
import { FakemonBreedingInformationManagerService } from '../../services/FakemonDataManagers/FakemonBreedingInformationManagerService.js';
import { FakemonCapabilityManagerService } from '../../services/FakemonDataManagers/FakemonCapabilityManagerService.js';
import { FakemonEnvironmentManagerService } from '../../services/FakemonDataManagers/FakemonEnvironmentManagerService.js';
import { FakemonSkillManagerService } from '../../services/FakemonDataManagers/FakemonSkillManagerService.js';
import { FakemonStatManagerService } from '../../services/FakemonDataManagers/FakemonStatManagerService.js';
import { FakemonInteractionManagerService } from '../../services/FakemonInteractionManagerService/FakemonInteractionManagerService.js';
import { FakemonInteractionManagerPage } from '../../services/FakemonInteractionManagerService/types.js';
import { PtuAutocompleteParameterName } from '../../types/autocomplete.js';
import {
    PokemonDiet,
    PokemonEggGroup,
    PokemonGenderRatio,
    PokemonHabitat,
    PokemonType,
    PtuNaturewalk,
} from '../../types/pokemon.js';
import type {
    PtuButtonIteractionStrategy,
    PtuChatIteractionStrategy,
    PtuStrategyMap,
    PtuStrategyMetadata,
    PtuStringSelectMenuIteractionStrategy,
} from '../../types/strategies.js';

interface FakemonCreateGetParameterResults
{
    speciesName: string;
    baseSpeciesOn: string | null;
    baseMovesOn: string | null;
    baseAbilitiesOn: string | null;
    image: Attachment | null;
    imageUrl: string | null;
    coEditor: User | null;
}

interface GetBasedOnPokemonSpeciesResponse
{
    species: PtuFakemonCollection | PtuPokemonForLookupPokemon | null;
    moves: PtuFakemonCollection | PtuPokemonForLookupPokemon | null;
    abilities: PtuFakemonCollection | PtuPokemonForLookupPokemon | null;
}

@staticImplements<
    PtuChatIteractionStrategy
    & PtuButtonIteractionStrategy
    & PtuStringSelectMenuIteractionStrategy
>()
export class FakemonCreateStrategy
{
    public static key = PtuFakemonSubcommand.Create;

    private static basePokemon: Omit<PtuFakemonToCreate, 'creationChannelId'> = {
        name: '',
        types: [],
        baseStats: {
            hp: 0,
            attack: 0,
            defense: 0,
            specialAttack: 0,
            specialDefense: 0,
            speed: 0,
        },
        moveList: {
            levelUp: [],
            tmHm: [],
            eggMoves: [],
            tutorMoves: [],
        },
        abilities: {
            basicAbilities: ['PLACEHOLDER', 'PLACEHOLDER'],
            advancedAbilities: ['PLACEHOLDER', 'PLACEHOLDER'],
            highAbility: 'PLACEHOLDER',
        },
        evolution: [{
            level: 1,
            name: '',
            stage: 1,
        }],
        capabilities: {
            overland: 0,
            swim: 0,
            sky: 0,
            levitate: 0,
            burrow: 0,
            highJump: 0,
            lowJump: 0,
            power: 0,
            other: [],
        },
        sizeInformation: {
            height: {
                freedom: `0'0"`,
                metric: '0m',
                ptu: '0',
            },
            weight: {
                freedom: '0lbs',
                metric: '0kg',
                ptu: 0,
            },
        },
        breedingInformation: {
            genderRatio: { none: true },
            eggGroups: [PokemonEggGroup.None],
        },
        diets: ['PLACEHOLDER'],
        habitats: ['PLACEHOLDER'],
        skills: {
            acrobatics: '2d6+0',
            athletics: '2d6+0',
            combat: '2d6+0',
            stealth: '2d6+0',
            perception: '2d6+0',
            focus: '2d6+0',
        },
        metadata: {
            source: 'Eden Dex',
        },
        megaEvolutions: [],
        editors: [DiscordUserId.Bean],
        status: PtuFakemonStatus.DRAFT,
        feedbacks: [],
    };

    public static async run(
        interaction: ChatInputCommandInteraction,
        strategies: PtuStrategyMap,
    ): Promise<boolean>
    {
        const {
            speciesName,
            baseSpeciesOn,
            baseMovesOn,
            baseAbilitiesOn,
            // image,
            // imageUrl,
            coEditor,
        } = this.getOptions(interaction);

        // Get pokemon to base this fakemon on
        const pokemonToBaseOn = await this.getBasedOnPokemonSpecies({
            strategies,
            baseSpeciesOn,
            baseMovesOn,
            baseAbilitiesOn,
            userId: interaction.user.id,
        });

        // Initialize initial fakemon data
        const message = await interaction.fetchReply();
        await this.initializeFakemon({
            speciesName,
            messageId: message.id,
            creationChannelId: interaction.channelId,
            coEditorUserId: coEditor?.id,
            pokemonToBaseOn,
        });

        // Send response
        await FakemonInteractionManagerService.navigateTo({
            interaction,
            page: FakemonInteractionManagerPage.Overview,
            messageId: message.id,
            interactionType: 'editReply',
        });

        return true;
    }

    // TODO: Re-implement or remove once done if buttons are still needed or not
    public static async runButton(
        interaction: ButtonInteraction,
        _strategies: PtuStrategyMap,
        _metadata: PtuStrategyMetadata,
    ): Promise<boolean>
    {
        // Defer update
        await interaction.deferUpdate();

        // const { customId } = interaction;
        const fakemon = PtuFakemonPseudoCache.getByMessageId(interaction.message.id);
        if (!fakemon)
        {
            throw new Error('Fakemon not found');
        }

        // switch (customId)
        // {
        //     default:
        //         const typeGuard: never = customId;
        //         throw new Error(`Unhandled customId: ${typeGuard}`);
        // }

        return true;
    }

    public static async runStringSelect(
        interaction: StringSelectMenuInteraction,
        _strategies: PtuStrategyMap,
        { message }: PtuStrategyMetadata,
    ): Promise<boolean>
    {
        const { customId, values = [] } = interaction as {
            customId: FakemonOverviewStringSelectCustomIds.Navigation;
            values: FakemonInteractionManagerPage[];
        } | {
            customId: FakemonStatsStringSelectCustomIds.EditStat;
            values: FakemonStatsEditStringSelectElementOptions[];
        } | {
            customId: FakemonStatsStringSelectCustomIds.SwapStats;
            values: FakemonStatsSwapStringSelectElementOptions[];
        } | {
            customId: FakemonBasicInformationStringSelectCustomIds.EditTypes;
            values: PokemonType[];
        } | {
            customId: FakemonBasicInformationStringSelectCustomIds.EditAbilities;
            values: FakemonBIEditAbilitiesStringSelectElementOptions[];
        } | {
            customId: FakemonSizeInformationStringSelectCustomIds.EditHeightOrWeight;
            values: FakemonSIEditSizeStringSelectElementOptions[];
        } | {
            customId: FakemonBreedingInformationStringSelectCustomIds.EditGenderRatio;
            values: PokemonGenderRatio[];
        } | {
            customId: FakemonBreedingInformationStringSelectCustomIds.EditEggGroups;
            values: PokemonEggGroup[];
        } | {
            customId: FakemonEnvironmentStringSelectCustomIds.EditDiets;
            values: PokemonDiet[];
        } | {
            customId: FakemonEnvironmentStringSelectCustomIds.EditHabitats;
            values: PokemonHabitat[];
        } | {
            customId: FakemonCapabilitiesStringSelectCustomIds.EditCapabilities;
            values: FakemonCapabilitiesEditCapabilitiesStringSelectElementOptions[];
        } | {
            customId: FakemonCapabilitiesStringSelectCustomIds.EditNaturewalk;
            values: PtuNaturewalk[];
        } | {
            customId: FakemonCapabilitiesStringSelectCustomIds.RemoveOtherCapabilities;
            values: string[];
        } | {
            customId: FakemonSkillsStringSelectCustomIds.EditSkill;
            values: FakemonSkillsEditStringSelectElementOptions[];
        };
        const [value1, value2] = values;
        const fakemon = PtuFakemonPseudoCache.getByMessageId(interaction.message.id);
        if (!fakemon)
        {
            throw new Error('Fakemon not found');
        }

        // Used by some cases to determine which modal to show
        let modalToShow: typeof BaseCustomModal;

        switch (customId)
        {
            // Navigation selector
            case FakemonOverviewStringSelectCustomIds.Navigation:
                await interaction.deferUpdate(); // Defer for navigation
                await FakemonInteractionManagerService.navigateTo({
                    interaction,
                    page: value1 as FakemonInteractionManagerPage,
                    messageId: message.id,
                });
                break;

            // Stat selector
            case FakemonStatsStringSelectCustomIds.EditStat:
                const statKey = FakemonStatManagerService.getStatKey(value1 as FakemonStatsEditStringSelectElementOptions);
                // Don't defer before showing a modal, as that will throw an error
                await FakemonStatEditingModal.showModal(interaction, {
                    messageId: message.id,
                    statToEdit: value1 as FakemonStatsEditStringSelectElementOptions,
                    // Add default value if stat is not 0
                    stat: fakemon.baseStats[statKey],
                });
                break;

            // Swapping stats
            case FakemonStatsStringSelectCustomIds.SwapStats:
                await interaction.deferUpdate(); // Defer for database update
                // Get input for stats to swap
                const swapStatsValue = value1 as FakemonStatsSwapStringSelectElementOptions;
                let statsToSwap: [FakemonStatsEditStringSelectElementOptions, FakemonStatsEditStringSelectElementOptions];
                switch (swapStatsValue)
                {
                    case FakemonStatsSwapStringSelectElementOptions.AttackStats:
                        statsToSwap = [
                            FakemonStatsEditStringSelectElementOptions.Attack,
                            FakemonStatsEditStringSelectElementOptions.SpecialAttack,
                        ];
                        break;
                    case FakemonStatsSwapStringSelectElementOptions.DefenseStats:
                        statsToSwap = [
                            FakemonStatsEditStringSelectElementOptions.Defense,
                            FakemonStatsEditStringSelectElementOptions.SpecialDefense,
                        ];
                        break;
                    case FakemonStatsSwapStringSelectElementOptions.PhysicalStats:
                        statsToSwap = [
                            FakemonStatsEditStringSelectElementOptions.Attack,
                            FakemonStatsEditStringSelectElementOptions.Defense,
                        ];
                        break;
                    case FakemonStatsSwapStringSelectElementOptions.SpecialStats:
                        statsToSwap = [
                            FakemonStatsEditStringSelectElementOptions.SpecialAttack,
                            FakemonStatsEditStringSelectElementOptions.SpecialDefense,
                        ];
                        break;
                    default:
                        const typeCheck: never = swapStatsValue;
                        throw new Error(`Unhandled swapStatsValue: ${typeCheck}`);
                }

                // Swap stats & update message
                try
                {
                    await FakemonStatManagerService.swapStats({
                        fakemon,
                        messageId: interaction.message.id,
                        statsToSwap,
                    });
                }
                catch (error)
                {
                    const errorMessage = (error as Error)?.message;
                    await interaction.followUp({
                        content: [
                            `Failed to update fakemon${errorMessage ? ' with error:' : ''}`,
                            ...(errorMessage && [Text.Code.multiLine(errorMessage)]),
                        ].join('\n'),
                        ephemeral: true,
                    });
                    break;
                }
                await FakemonInteractionManagerService.navigateTo({
                    interaction,
                    page: FakemonInteractionManagerPage.Stats,
                    messageId: interaction.message.id,
                });
                break;

            // Types selector
            case FakemonBasicInformationStringSelectCustomIds.EditTypes:
                await interaction.deferUpdate(); // Defer for database update
                try
                {
                    await FakemonBasicInformationManagerService.setTypes({
                        messageId: interaction.message.id,
                        fakemon,
                        types: [value1, value2] as PokemonType[],
                    });
                }
                catch (error)
                {
                    const errorMessage = (error as Error)?.message;
                    await interaction.followUp({
                        content: [
                            `Failed to update fakemon${errorMessage ? ' with error:' : ''}`,
                            ...(errorMessage && [Text.Code.multiLine(errorMessage)]),
                        ].join('\n'),
                        ephemeral: true,
                    });
                    break;
                }
                await FakemonInteractionManagerService.navigateTo({
                    interaction,
                    page: FakemonInteractionManagerPage.BasicInformation,
                    messageId: interaction.message.id,
                });
                break;

            // Edit abilities model
            case FakemonBasicInformationStringSelectCustomIds.EditAbilities:
                // Don't defer before showing a modal, as that will throw an error

                // Get which modal to show
                const editAbilitiesValue = value1 as FakemonBIEditAbilitiesStringSelectElementOptions;
                switch (editAbilitiesValue)
                {
                    case FakemonBIEditAbilitiesStringSelectElementOptions.TwoBasicTwoAdvancedOneHigh:
                        modalToShow = FakemonAbilityEditingModal1;
                        break;

                    case FakemonBIEditAbilitiesStringSelectElementOptions.OneBasicThreeAdvancedOneHigh:
                        modalToShow = FakemonAbilityEditingModal2;
                        break;

                    default:
                        const typeCheck: never = editAbilitiesValue;
                        throw new Error(`Unhandled value: ${typeCheck}`);
                }

                await modalToShow.showModal(interaction, {
                    messageId: message.id,
                });
                break;

            // Edit size modals
            case FakemonSizeInformationStringSelectCustomIds.EditHeightOrWeight:
                // Don't defer before showing a modal, as that will throw an error

                // Get which modal to show
                const editSizeValue = value1 as FakemonSIEditSizeStringSelectElementOptions;
                switch (editSizeValue)
                {
                    case FakemonSIEditSizeStringSelectElementOptions.Height:
                        modalToShow = FakemonSIHeightEditingModal;
                        break;

                    case FakemonSIEditSizeStringSelectElementOptions.Weight:
                        modalToShow = FakemonSIWeightEditingModal;
                        break;

                    default:
                        const typeCheck: never = editSizeValue;
                        throw new Error(`Unhandled value: ${typeCheck}`);
                }

                await modalToShow.showModal(interaction, {
                    messageId: message.id,
                });
                break;

            // Gender ratio selector
            case FakemonBreedingInformationStringSelectCustomIds.EditGenderRatio:
                await interaction.deferUpdate(); // Defer for database update
                try
                {
                    await FakemonBreedingInformationManagerService.setGenderRatio({
                        messageId: interaction.message.id,
                        fakemon,
                        genderRatio: value1 as PokemonGenderRatio,
                    });
                }
                catch (error)
                {
                    const errorMessage = (error as Error)?.message;
                    await interaction.followUp({
                        content: [
                            `Failed to update fakemon${errorMessage ? ' with error:' : ''}`,
                            ...(errorMessage && [Text.Code.multiLine(errorMessage)]),
                        ].join('\n'),
                        ephemeral: true,
                    });
                    break;
                }
                await FakemonInteractionManagerService.navigateTo({
                    interaction,
                    page: FakemonInteractionManagerPage.BreedingInformation,
                    messageId: interaction.message.id,
                });
                break;

            // Egg groups selector
            case FakemonBreedingInformationStringSelectCustomIds.EditEggGroups:
                await interaction.deferUpdate(); // Defer for database update
                try
                {
                    await FakemonBreedingInformationManagerService.setEggGroups({
                        messageId: interaction.message.id,
                        fakemon,
                        eggGroups: [value1, value2].filter(Boolean) as PokemonEggGroup[],
                    });
                }
                catch (error)
                {
                    const errorMessage = (error as Error)?.message;
                    await interaction.followUp({
                        content: [
                            `Failed to update fakemon${errorMessage ? ' with error:' : ''}`,
                            ...(errorMessage && [Text.Code.multiLine(errorMessage)]),
                        ].join('\n'),
                        ephemeral: true,
                    });
                    break;
                }
                await FakemonInteractionManagerService.navigateTo({
                    interaction,
                    page: FakemonInteractionManagerPage.BreedingInformation,
                    messageId: interaction.message.id,
                });
                break;

            // Diets selector
            case FakemonEnvironmentStringSelectCustomIds.EditDiets:
                await interaction.deferUpdate(); // Defer for database update
                try
                {
                    await FakemonEnvironmentManagerService.setDiets({
                        messageId: interaction.message.id,
                        fakemon,
                        diets: values as PokemonDiet[],
                    });
                }
                catch (error)
                {
                    const errorMessage = (error as Error)?.message;
                    await interaction.followUp({
                        content: [
                            `Failed to update fakemon${errorMessage ? ' with error:' : ''}`,
                            ...(errorMessage && [Text.Code.multiLine(errorMessage)]),
                        ].join('\n'),
                        ephemeral: true,
                    });
                    break;
                }
                await FakemonInteractionManagerService.navigateTo({
                    interaction,
                    page: FakemonInteractionManagerPage.Environment,
                    messageId: interaction.message.id,
                });
                break;

            // Habitats selector
            case FakemonEnvironmentStringSelectCustomIds.EditHabitats:
                await interaction.deferUpdate(); // Defer for database update
                try
                {
                    await FakemonEnvironmentManagerService.setHabitats({
                        messageId: interaction.message.id,
                        fakemon,
                        habitats: values as PokemonHabitat[],
                    });
                }
                catch (error)
                {
                    const errorMessage = (error as Error)?.message;
                    await interaction.followUp({
                        content: [
                            `Failed to update fakemon${errorMessage ? ' with error:' : ''}`,
                            ...(errorMessage && [Text.Code.multiLine(errorMessage)]),
                        ].join('\n'),
                        ephemeral: true,
                    });
                    break;
                }
                await FakemonInteractionManagerService.navigateTo({
                    interaction,
                    page: FakemonInteractionManagerPage.Environment,
                    messageId: interaction.message.id,
                });
                break;

            // Capability-editing modals
            case FakemonCapabilitiesStringSelectCustomIds.EditCapabilities:
                // Don't defer before showing a modal, as that will throw an error

                // // Get which modal to show
                const editCapabilitiesValue = value1 as FakemonCapabilitiesEditCapabilitiesStringSelectElementOptions;
                switch (editCapabilitiesValue)
                {
                    case FakemonCapabilitiesEditCapabilitiesStringSelectElementOptions.MovementCapabilities:
                        modalToShow = FakemonNonOtherCapabilityEditingModal1;
                        break;

                    case FakemonCapabilitiesEditCapabilitiesStringSelectElementOptions.NonMovementCapabilities:
                        modalToShow = FakemonNonOtherCapabilityEditingModal2;
                        break;

                    case FakemonCapabilitiesEditCapabilitiesStringSelectElementOptions.AddOtherCapabilities:
                        modalToShow = FakemonOtherCapabilityAddingModal;
                        break;

                    default:
                        const typeCheck: never = editCapabilitiesValue;
                        throw new Error(`Unhandled value: ${typeCheck}`);
                }

                await modalToShow.showModal(interaction, {
                    messageId: message.id,
                });
                break;

            // Naturewalk selector
            case FakemonCapabilitiesStringSelectCustomIds.EditNaturewalk:
                await interaction.deferUpdate(); // Defer for database update
                try
                {
                    await FakemonCapabilityManagerService.setNaturewalk({
                        messageId: interaction.message.id,
                        fakemon,
                        naturewalks: values as PtuNaturewalk[],
                    });
                }
                catch (error)
                {
                    const errorMessage = (error as Error)?.message;
                    await interaction.followUp({
                        content: [
                            `Failed to update fakemon${errorMessage ? ' with error:' : ''}`,
                            ...(errorMessage && [Text.Code.multiLine(errorMessage)]),
                        ].join('\n'),
                        ephemeral: true,
                    });
                    break;
                }
                await FakemonInteractionManagerService.navigateTo({
                    interaction,
                    page: FakemonInteractionManagerPage.Capabilities,
                    messageId: interaction.message.id,
                });
                break;

            // Remove other capabilities selector
            case FakemonCapabilitiesStringSelectCustomIds.RemoveOtherCapabilities:
                await interaction.deferUpdate(); // Defer for database update
                try
                {
                    await FakemonCapabilityManagerService.setOtherCapabilities({
                        messageId: interaction.message.id,
                        fakemon,
                        other: values,
                    });
                }
                catch (error)
                {
                    const errorMessage = (error as Error)?.message;
                    await interaction.followUp({
                        content: [
                            `Failed to update fakemon${errorMessage ? ' with error:' : ''}`,
                            ...(errorMessage && [Text.Code.multiLine(errorMessage)]),
                        ].join('\n'),
                        ephemeral: true,
                    });
                    break;
                }
                await FakemonInteractionManagerService.navigateTo({
                    interaction,
                    page: FakemonInteractionManagerPage.Capabilities,
                    messageId: interaction.message.id,
                });
                break;

            // Skill selector
            case FakemonSkillsStringSelectCustomIds.EditSkill:
                const { skillDice, skillModifier } = FakemonSkillManagerService.getSkillDiceAndModifier(
                    message.id,
                    value1 as FakemonSkillsEditStringSelectElementOptions,
                );
                // Don't defer before showing a modal, as that will throw an error
                await FakemonSkillEditingModal.showModal(interaction, {
                    messageId: message.id,
                    skillToEdit: value1 as FakemonStatsEditStringSelectElementOptions,
                    // Add default values
                    skillDice,
                    skillModifier,
                });
                break;

            default:
                const typeGuard: never = customId;
                throw new Error(`Unhandled customId: ${typeGuard}`);
        }

        return true;
    }

    private static getOptions(interaction: ChatInputCommandInteraction): FakemonCreateGetParameterResults
    {
        const speciesName = interaction.options.getString('species_name', true);
        const baseSpeciesOn = interaction.options.getString(PtuAutocompleteParameterName.BaseSpeciesOn);
        const baseMovesOn = interaction.options.getString(PtuAutocompleteParameterName.BaseMovesOn);
        const baseAbilitiesOn = interaction.options.getString(PtuAutocompleteParameterName.BaseAbilitiesOn);
        const image = interaction.options.getAttachment('image');
        const imageUrl = interaction.options.getString('image_url');
        const coEditor = interaction.options.getUser('co_editor');

        return {
            speciesName,
            baseSpeciesOn,
            baseMovesOn,
            baseAbilitiesOn,
            image,
            imageUrl,
            coEditor,
        };
    }

    private static async initializeFakemon({
        speciesName,
        messageId,
        creationChannelId,
        coEditorUserId,
        pokemonToBaseOn,
    }: {
        speciesName: string;
        messageId: string;
        creationChannelId: string;
        coEditorUserId?: string;
        pokemonToBaseOn: GetBasedOnPokemonSpeciesResponse;
    }): Promise<PtuFakemonCollection>
    {
        return await PtuFakemonPseudoCache.create(messageId, {
            ...this.basePokemon,
            ...pokemonToBaseOn.species,
            name: speciesName,
            evolution: pokemonToBaseOn.species?.evolution || [{
                level: 1,
                name: speciesName,
                stage: 1,
            }],
            abilities: {
                // Take abilities in priority order of:
                // 1. pokemonToBaseOn.abilities
                // 2. pokemonToBaseOn.species
                // 3. this.basePokemon
                basicAbilities: pokemonToBaseOn.abilities?.abilities.basicAbilities
                    || pokemonToBaseOn.species?.abilities.basicAbilities
                    || this.basePokemon.abilities.basicAbilities,
                advancedAbilities: pokemonToBaseOn.abilities?.abilities.advancedAbilities
                    || pokemonToBaseOn.species?.abilities.advancedAbilities
                    || this.basePokemon.abilities.advancedAbilities,
                highAbility: pokemonToBaseOn.abilities?.abilities.highAbility
                    || pokemonToBaseOn.species?.abilities.highAbility
                    || this.basePokemon.abilities.highAbility,
            },
            moveList: {
                // Take moves in priority order of:
                // 1. pokemonToBaseOn.moves
                // 2. pokemonToBaseOn.species
                // 3. this.basePokemon
                eggMoves: pokemonToBaseOn.moves?.moveList.eggMoves
                    || pokemonToBaseOn.species?.moveList.eggMoves
                    || this.basePokemon.moveList.eggMoves,
                levelUp: pokemonToBaseOn.moves?.moveList.levelUp
                    || pokemonToBaseOn.species?.moveList.levelUp
                    || this.basePokemon.moveList.levelUp,
                tmHm: pokemonToBaseOn.moves?.moveList.tmHm
                    || pokemonToBaseOn.species?.moveList.tmHm
                    || this.basePokemon.moveList.tmHm,
                tutorMoves: pokemonToBaseOn.moves?.moveList.tutorMoves
                    || pokemonToBaseOn.species?.moveList.tutorMoves
                    || this.basePokemon.moveList.tutorMoves,
                zygardeCubeMoves: pokemonToBaseOn.moves?.moveList.zygardeCubeMoves
                    || pokemonToBaseOn.species?.moveList.zygardeCubeMoves
                    || this.basePokemon.moveList.zygardeCubeMoves,
            },
            metadata: this.basePokemon.metadata,
            creationChannelId,
            editors: coEditorUserId
                ? [...new Set([...this.basePokemon.editors, coEditorUserId])]
                : this.basePokemon.editors,
        });
    }

    private static async getBasedOnPokemonSpecies({
        strategies,
        baseSpeciesOn,
        baseMovesOn,
        baseAbilitiesOn,
        userId,
    }: {
        strategies: PtuStrategyMap;
        baseSpeciesOn: string | null;
        baseMovesOn: string | null;
        baseAbilitiesOn: string | null;
        userId: string;
    }): Promise<GetBasedOnPokemonSpeciesResponse>
    {
        const [pokemon, fakemon] = await Promise.all([
            strategies[PtuSubcommandGroup.Lookup][PtuLookupSubcommand.Pokemon]?.getLookupData({
                names: [baseSpeciesOn, baseMovesOn, baseAbilitiesOn].filter(Boolean),
            }) as Promise<PtuPokemonForLookupPokemon[]>,
            PtuFakemonPseudoCache.getByNames(
                [baseSpeciesOn, baseMovesOn, baseAbilitiesOn].filter(element => element !== null),
                userId,
            ),
        ]);

        return [...pokemon, ...fakemon].reduce<GetBasedOnPokemonSpeciesResponse>((acc, curPokemon) =>
        {
            const {
                _id,
                id: _1,
                editors: _2,
                status: _3,
                creationChannelId: _4,
                feedbacks: _5,
                ...curPokemonWithoutFakemonData
            } = curPokemon as PtuFakemonCollection;

            if (curPokemon.name === baseSpeciesOn)
            {
                acc.species = curPokemonWithoutFakemonData as PtuFakemonCollection;
            }
            else if (curPokemon.name === baseMovesOn)
            {
                acc.moves = curPokemonWithoutFakemonData as PtuFakemonCollection;
            }
            else if (curPokemon.name === baseAbilitiesOn)
            {
                acc.abilities = curPokemonWithoutFakemonData as PtuFakemonCollection;
            }
            return acc;
        }, {
            species: null,
            moves: null,
            abilities: null,
        });
    }
}
