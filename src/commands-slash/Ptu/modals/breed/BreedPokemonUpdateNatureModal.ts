import {
    type ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';

import { BaseCustomModal, InputValuesMap } from '../../../../modals/BaseCustomModal.js';
import { capitalizeFirstLetter } from '../../../../services/stringHelpers.js';
import { getPokemonBreedingEmbedMessage } from '../../embed-messages/breed.js';
import breedPokemonStateSingleton, { BreedPokemonShouldPickKey } from '../../models/breedPokemonStateSingleton.js';
import { getBreedPokemonUpdatablesButtonRowComponent } from '../../services/breedPokemonHelpers.js';
import { LookupNatureStrategy } from '../../strategies/lookup/LookupNatureStrategy.js';
import { FullPokemonStat, PokemonStat } from '../../types/pokemon.js';
import { PtuNature } from '../../types/PtuNature.js';

enum BreedPokemonNatureCustomIds
{
    NatureName = 'nature-name-input',
    RaisedStat = 'raised-stat-input',
    LoweredStat = 'lowered-stat-input',
}

enum BreedPokemonNatureLabelName
{
    NatureName = 'Nature Name',
    RaisedStat = 'raised-stat-input',
    LoweredStat = 'lowered-stat-input',
}

interface GetNatureDataResult
{
    natureNames: string[];
    natures: PtuNature[];
}

export class BreedPokemonUpdateNatureModal extends BaseCustomModal
{
    public static id = 'breed-pokemon-update-nature-modal';
    public static title = 'Breeding Pokemon Update Nature';
    protected static inputValuesMap: InputValuesMap = {
        [BreedPokemonNatureCustomIds.NatureName]: [
            {
                key: BreedPokemonNatureCustomIds.NatureName,
                label: BreedPokemonNatureLabelName.NatureName,
                value: '',
                typeOfValue: 'string',
            },
        ],
        [BreedPokemonNatureCustomIds.RaisedStat]: [
            {
                key: BreedPokemonNatureCustomIds.RaisedStat,
                label: BreedPokemonNatureLabelName.RaisedStat,
                value: '',
                typeOfValue: 'string',
            },
        ],
        [BreedPokemonNatureCustomIds.LoweredStat]: [
            {
                key: BreedPokemonNatureCustomIds.LoweredStat,
                label: BreedPokemonNatureLabelName.LoweredStat,
                value: '',
                typeOfValue: 'string',
            },
        ],
    };

    protected static styleMap = {
        [BreedPokemonNatureCustomIds.NatureName]: TextInputStyle.Short,
        [BreedPokemonNatureCustomIds.RaisedStat]: TextInputStyle.Short,
        [BreedPokemonNatureCustomIds.LoweredStat]: TextInputStyle.Short,
    };

    private static allValidStats: (PokemonStat | FullPokemonStat)[] = [
        ...Object.values(PokemonStat),
        ...Object.values(FullPokemonStat),
    ];

    public static getTextInputs(): TextInputBuilder[]
    {
        const nameInput = new TextInputBuilder()
            .setCustomId(BreedPokemonNatureCustomIds.NatureName)
            .setLabel(BreedPokemonNatureLabelName.NatureName)
            .setStyle(this.styleMap[BreedPokemonNatureCustomIds.NatureName])
            .setRequired(false);

        const raisedStatInput = new TextInputBuilder()
            .setCustomId(BreedPokemonNatureCustomIds.RaisedStat)
            .setLabel(BreedPokemonNatureLabelName.RaisedStat)
            .setStyle(this.styleMap[BreedPokemonNatureCustomIds.RaisedStat])
            .setRequired(false);

        const loweredStatInput = new TextInputBuilder()
            .setCustomId(BreedPokemonNatureCustomIds.LoweredStat)
            .setLabel(BreedPokemonNatureLabelName.LoweredStat)
            .setStyle(this.styleMap[BreedPokemonNatureCustomIds.LoweredStat])
            .setRequired(false);

        return [
            nameInput,
            raisedStatInput,
            loweredStatInput,
        ];
    }

    public static async run(interaction: ModalSubmitInteraction): Promise<void>
    {
        // Parse input
        const {
            [BreedPokemonNatureCustomIds.NatureName]: natureName,
            [BreedPokemonNatureCustomIds.RaisedStat]: raisedStat,
            [BreedPokemonNatureCustomIds.LoweredStat]: loweredStat,
        } = this.parseInput<BreedPokemonNatureCustomIds>(interaction) as {
            [BreedPokemonNatureCustomIds.NatureName]: string;
            [BreedPokemonNatureCustomIds.RaisedStat]: string;
            [BreedPokemonNatureCustomIds.LoweredStat]: string;
        };

        // Exit early if input is invalid
        if (!(natureName !== undefined && (raisedStat !== undefined || loweredStat !== undefined)))
        {
            await interaction.reply({
                content: `Input is invalid. Either nature name or a raised and lowered stat must be provided.`,
                ephemeral: true,
            });
            return;
        }

        // Get valid inputs
        const { natureNames, natures } = await this.getNatureData({
            natureName,
            raisedStat,
            loweredStat,
        });

        // Exit early if input is invalid
        if (natures.length === 0)
        {
            const possibleNatures = `\`\`\`\n- ${natureNames.join('\n- ')}\n\`\`\``;
            const possibleStats = `\`\`\`\n- ${this.allValidStats.join('\n- ')}\n\`\`\``;
            await interaction.reply({
                content: `Input is invalid. Nature must be one of the following:\n${possibleNatures}Or stats must be one of the following:\n${possibleStats}`,
                ephemeral: true,
            });
            return;
        }
        if (natures.length > 1)
        {
            await interaction.reply({
                content: `Input is invalid. Too many natures were found. Either nature name or a raised and lowered stat must be provided.`,
                ephemeral: true,
            });
            return;
        }

        const [nature] = natures;

        // Update state
        const stateKey = interaction.message?.id as string;
        const previousState = breedPokemonStateSingleton.get(stateKey);
        const newState = breedPokemonStateSingleton.upsert(stateKey, {
            ...previousState,
            nature,
            userShouldPick: {
                ...previousState.userShouldPick,
                [BreedPokemonShouldPickKey.Nature]: false,
            },
        });

        // Get message data
        const component = getBreedPokemonUpdatablesButtonRowComponent({
            userShouldPick: newState.userShouldPick,
            gmShouldPick: newState.gmShouldPick,
        });
        const embed = getPokemonBreedingEmbedMessage(newState);

        // Update message
        await interaction.message?.edit({
            components: [component],
            embeds: [embed],
        });
        await interaction.reply({
            content: 'Updated',
            ephemeral: true,
        });
    }

    private static async getNatureData({
        natureName = '',
        raisedStat = '',
        loweredStat = '',
    }: {
        natureName: string;
        raisedStat: string;
        loweredStat: string;
    }): Promise<GetNatureDataResult>
    {
        const allNatures = await LookupNatureStrategy.getLookupData();
        const natureNames = allNatures.map(({ name }) => name);

        const input = {
            name: capitalizeFirstLetter(natureName.toLowerCase()),
            raisedStat: this.allValidStats.find(stat =>
                stat.toLowerCase() === raisedStat.toLowerCase(),
            ),
            loweredStat: this.allValidStats.find(stat =>
                stat.toLowerCase() === loweredStat.toLowerCase(),
            ),
        };

        if (
            (raisedStat && input.raisedStat === undefined)
            || (loweredStat && input.loweredStat === undefined)
        )
        {
            return {
                natureNames,
                natures: [],
            };
        }

        const natures = await LookupNatureStrategy.getLookupData({
            ...(natureName && { name: input.name }),
            ...(raisedStat && { raisedStat: input.raisedStat }),
            ...(loweredStat && { loweredStat: input.loweredStat }),
        });

        return {
            natureNames,
            natures,
        };
    }
}
