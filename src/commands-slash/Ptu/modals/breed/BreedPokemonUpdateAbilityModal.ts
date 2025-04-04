import {
    type ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';

import { BaseCustomModal, InputValuesMap } from '../../../../modals/BaseCustomModal.js';
import { getPokemonBreedingEmbedMessage } from '../../embed-messages/breed.js';
import breedPokemonStateSingleton, { BreedPokemonShouldPickKey } from '../../models/breedPokemonStateSingleton.js';
import { getBreedPokemonUpdatablesButtonRowComponent } from '../../services/breedPokemonHelpers.js';
import { LookupAbilityStrategy } from '../../strategies/lookup/LookupAbilityStrategy.js';
import { BreedPokemonCustomIds, BreedPokemonModalLabel } from './types.js';

export class BreedPokemonUpdateAbilityModal extends BaseCustomModal
{
    public static id = 'breed-pokemon-update-ability-modal';
    public static title = 'Breeding Pokemon Update Ability';
    protected static inputValuesMap: InputValuesMap = {
        [BreedPokemonCustomIds.Input]: [
            {
                key: BreedPokemonCustomIds.Input,
                label: BreedPokemonModalLabel.Ability,
                value: '',
                typeOfValue: 'string',
            },
        ],
    };

    protected static styleMap = {
        [BreedPokemonCustomIds.Input]: TextInputStyle.Short,
    };

    public static getTextInputs(): TextInputBuilder[]
    {
        const input = new TextInputBuilder()
            .setCustomId(BreedPokemonCustomIds.Input)
            .setLabel(BreedPokemonModalLabel.Ability)
            .setStyle(this.styleMap[BreedPokemonCustomIds.Input])
            .setRequired(true);

        return [
            input,
        ];
    }

    public static async run(interaction: ModalSubmitInteraction): Promise<void>
    {
        // Parse input
        const { input } = this.parseInput<BreedPokemonCustomIds>(interaction) as {
            input: string;
        };

        // Exit early if input is invalid
        const abilities = await LookupAbilityStrategy.getLookupData();
        const ability = abilities.find(({ name }) => name.toLowerCase() === input.toLowerCase());

        if (ability === undefined)
        {
            await interaction.reply({
                content: 'Input is invalid. Ability not found. Please try again.',
                ephemeral: true,
            });
            return;
        }

        // Update state
        const stateKey = interaction.message?.id as string;
        const previousState = breedPokemonStateSingleton.get(stateKey);
        const newState = breedPokemonStateSingleton.upsert(stateKey, {
            ...previousState,
            ability: ability.name,
            userShouldPick: {
                ...previousState.userShouldPick,
                [BreedPokemonShouldPickKey.Ability]: false,
            },
            gmShouldPick: {
                ...previousState.gmShouldPick,
                [BreedPokemonShouldPickKey.Ability]: false,
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
}
