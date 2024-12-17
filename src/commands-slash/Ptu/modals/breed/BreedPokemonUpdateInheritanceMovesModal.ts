import {
    type ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';

import { BaseCustomModal, InputValuesMap } from '../../../../modals/BaseCustomModal.js';
import { getPokemonBreedingEmbedMessage } from '../../embed-messages/breed.js';
import breedPokemonStateSingleton, { BreedPokemonShouldPickKey } from '../../models/breedPokemonStateSingleton.js';
import { getBreedPokemonUpdatablesButtonRowComponent } from '../../services/breedPokemonHelpers.js';
import { BreedPokemonCustomIds, BreedPokemonModalLabel } from './types.js';

enum BreedPokemonInheritanceMovesCustomIds
{
    Level20 = 'Level 20:',
    Level30 = 'Level 30:',
    Level40 = 'Level 40:',
    Level50 = 'Level 50:',
    Level60 = 'Level 60:',
    Level70 = 'Level 70:',
    Level80 = 'Level 80:',
    Level90 = 'Level 90:',
}

export class BreedPokemonUpdateInheritanceMovesModal extends BaseCustomModal
{
    public static id = 'breed-pokemon-update-inheritance-moves-modal';
    public static title = 'Breeding Pokemon Update Inheritance Moves';
    protected static inputValuesMap: InputValuesMap = {
        [BreedPokemonCustomIds.Input]: Object.values(
            BreedPokemonInheritanceMovesCustomIds,
        ).map((customId) =>
        {
            return {
                key: customId,
                label: customId,
                value: '',
                typeOfValue: 'string',
            };
        }),
    };

    protected static styleMap = {
        [BreedPokemonCustomIds.Input]: TextInputStyle.Paragraph,
    };

    public static getTextInputs(): TextInputBuilder[]
    {
        const input = new TextInputBuilder()
            .setCustomId(BreedPokemonCustomIds.Input)
            .setLabel(BreedPokemonModalLabel.InheritanceMoves)
            .setStyle(this.styleMap[BreedPokemonCustomIds.Input])
            .setValue(
                (this.inputData as Record<'inheritanceMoves', string>).inheritanceMoves ?? this.getInputValues(BreedPokemonCustomIds.Input),
            )
            .setRequired(false);

        return [
            input,
        ];
    }

    public static async run(interaction: ModalSubmitInteraction): Promise<void>
    {
        // Parse input
        const {
            [BreedPokemonCustomIds.Input]: input,
        } = this.parseInput<BreedPokemonCustomIds>(interaction) as {
            [BreedPokemonCustomIds.Input]: Record<string, string>;
        };

        const parsedInheritanceMoves = Object.entries(input).reduce<string>((acc, [key, value]) =>
        {
            if (value.trim().length === 0)
            {
                return acc;
            }

            const curLine = `${key}${value}\n`;
            return acc + curLine;
        }, '') || undefined; // Set to undefined for better default value setting if this data is edited later

        // Update state
        const stateKey = interaction.message?.id as string;
        const previousState = breedPokemonStateSingleton.get(stateKey);
        const newState = breedPokemonStateSingleton.upsert(stateKey, {
            ...previousState,
            inheritanceMoves: parsedInheritanceMoves,
            userShouldPick: {
                ...previousState.userShouldPick,
                [BreedPokemonShouldPickKey.InheritanceMoves]: false,
            },
            gmShouldPick: {
                ...previousState.gmShouldPick,
                [BreedPokemonShouldPickKey.InheritanceMoves]: false,
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
