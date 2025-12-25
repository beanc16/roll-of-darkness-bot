import {
    Attachment,
    ButtonInteraction,
    ChatInputCommandInteraction,
    StringSelectMenuInteraction,
    User,
} from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import fakemonStateSingleton, { FakemonState } from '../../models/fakemonStateSingleton.js';
import { PtuFakemonSubcommand } from '../../options/fakemon.js';
import { FakemonInteractionManagerService } from '../../services/FakemonInteractionManagerService/FakemonInteractionManagerService.js';
import { PtuAutocompleteParameterName } from '../../types/autocomplete.js';
import type { PtuButtonIteractionStrategy, PtuChatIteractionStrategy, PtuStrategyMap, PtuStringSelectMenuIteractionStrategy } from '../../types/strategies.js';
import { FakemonSelectorCustomIds } from '../../components/fakemon/types.js';
import { fakemonBackToOverviewButtonCustomId } from '../../components/fakemon/button/FakemonBackToOverviewButton.js';
import { FakemonInteractionManagerPage } from '../../services/FakemonInteractionManagerService/types.js';

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

@staticImplements<
    PtuChatIteractionStrategy
    & PtuButtonIteractionStrategy
    & PtuStringSelectMenuIteractionStrategy
>()
export class FakemonCreateStrategy
{
    public static key = PtuFakemonSubcommand.Create;

    private static basePokemon: FakemonState['pokemon'] = {
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
            eggGroups: [],
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
    };

    public static async run(
        interaction: ChatInputCommandInteraction,
        _strategies: PtuStrategyMap,
    ): Promise<boolean>
    {
        const {
            speciesName,
            // baseSpeciesOn,
            // baseMovesOn,
            // baseAbilitiesOn,
            // image,
            // imageUrl,
            // coEditor,
        } = this.getOptions(interaction);
        const message = await interaction.fetchReply();
        const state = this.initializeState(message.id, {
            ...this.basePokemon,
            name: speciesName,
            evolution: [{
                level: 1,
                name: speciesName,
                stage: 1,
            }],
        });

        // Send response
        await FakemonInteractionManagerService.navigateTo({
            interaction,
            page: FakemonInteractionManagerPage.Overview,
            state,
            interactionType: 'editReply',
        });

        return true;
    }

    public static async runButton(
        interaction: ButtonInteraction,
        _strategies: PtuStrategyMap,
    ): Promise<boolean>
    {
        const { customId } = interaction as {
            customId: typeof fakemonBackToOverviewButtonCustomId;
        };
        const state = fakemonStateSingleton.get(interaction.message.id);

        switch (customId)
        {
            // Back to overview
            case fakemonBackToOverviewButtonCustomId:
                await FakemonInteractionManagerService.navigateTo({
                    interaction,
                    page: FakemonInteractionManagerPage.Overview,
                    state,
                });
                break;

            default:
                const typeGuard: never = customId;
                throw new Error(`Unhandled customId: ${typeGuard}`);
        }

        return true;
    }

    public static async runStringSelect(
        interaction: StringSelectMenuInteraction,
        _strategies: PtuStrategyMap,
    ): Promise<boolean>
    {
        const { customId, values: [value] = [] } = interaction as {
            customId: FakemonSelectorCustomIds;
            values: FakemonInteractionManagerPage[];
        };
        const state = fakemonStateSingleton.get(interaction.message.id);

        switch (customId)
        {
            // Navigation-related selectors
            case FakemonSelectorCustomIds.Overview:
            case FakemonSelectorCustomIds.Stats:
                await FakemonInteractionManagerService.navigateTo({
                    interaction,
                    page: value,
                    state,
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

    private static initializeState(key: string, pokemon: FakemonState['pokemon']): FakemonState
    {
        fakemonStateSingleton.upsert(key, { pokemon });
        return fakemonStateSingleton.get(key);
    }
}
