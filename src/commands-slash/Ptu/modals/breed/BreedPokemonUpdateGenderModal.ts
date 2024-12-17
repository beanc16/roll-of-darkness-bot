import {
    type ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';

import { BaseCustomModal, InputValuesMap } from '../../../../modals/BaseCustomModal.js';
import { getPokemonBreedingEmbedMessage } from '../../embed-messages/breed.js';
import breedPokemonStateSingleton, { BreedPokemonShouldPickKey } from '../../models/breedPokemonStateSingleton.js';
import { getBreedPokemonUpdatablesButtonRowComponent } from '../../services/breedPokemonHelpers.js';
import { PokemonGender } from '../../types/breed.js';
import { BreedPokemonCustomIds, BreedPokemonModalLabel } from './types.js';

enum GenderInput
{
    Male = PokemonGender.Male,
    Female = PokemonGender.Female,
    Boy = PokemonGender.Male,
    Girl = PokemonGender.Female,
    M = PokemonGender.Male,
    F = PokemonGender.Female,
    B = PokemonGender.Male,
    G = PokemonGender.Female,
}

export class BreedPokemonUpdateGenderModal extends BaseCustomModal
{
    public static id = 'breed-pokemon-update-gender-modal';
    public static title = 'Breeding Pokemon Update Gender';
    protected static inputValuesMap: InputValuesMap = {
        [BreedPokemonCustomIds.Input]: [
            {
                key: BreedPokemonCustomIds.Input,
                label: BreedPokemonModalLabel.Gender,
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
            .setLabel(BreedPokemonModalLabel.Gender)
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

        // Parse input to enum
        const gender = Object.entries(GenderInput).find(([key, _value]) =>
            key.toString().toLowerCase() === input.toLowerCase(),
        )?.[1];

        // Exit early if input is invalid
        if (gender === undefined)
        {
            const possibleGenders = `\`\`\`\n- ${Object.values(GenderInput).join('\n- ')}\n\`\`\``;
            await interaction.reply({
                content: `Input is invalid. Gender must be one of the following:\n${possibleGenders}`,
                ephemeral: true,
            });
            return;
        }

        // Update state
        const stateKey = interaction.message?.id as string;
        const previousState = breedPokemonStateSingleton.get(stateKey);
        const newState = breedPokemonStateSingleton.upsert(stateKey, {
            ...previousState,
            genderResult: { gender: gender.toString() as PokemonGender },
            userShouldPick: {
                ...previousState.userShouldPick,
                [BreedPokemonShouldPickKey.Gender]: false,
            },
            gmShouldPick: {
                ...previousState.gmShouldPick,
                [BreedPokemonShouldPickKey.Gender]: false,
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
