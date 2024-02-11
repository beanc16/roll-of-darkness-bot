import {
    Message,
    ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';
import { BaseCustomModal } from '../BaseCustomModal';
import { RollOfDarknessPseudoCache } from '../../dal/RollOfDarknessPseudoCache';
import { getCombatTrackerActionRows } from '../../commands-slash/select-menus/combat_tracker';
import { updateCombatTrackerEmbedMessage } from '../../commands-slash/embed-messages/combat_tracker';
import { awaitCombatTrackerMessageComponents } from '../../commands-slash/message-component-handlers/combat_tracker';
import { Tracker } from '../../dal/RollOfDarknessMongoControllers';

export enum RemoveCharacterCustomIds
{
    Name = 'name-text-input',
}

export class RemoveCharacterModal extends BaseCustomModal
{
    static {
        this._id = 'remove-character-modal';
        this._title = 'Remove Character';
        this._inputValuesMap = {
        };
        this._styleMap = {
            [RemoveCharacterCustomIds.Name]: TextInputStyle.Short,
        };
    }

    static getTextInputs(): TextInputBuilder[]
    {
        const nameInput = new TextInputBuilder()
			.setCustomId(RemoveCharacterCustomIds.Name)
			.setLabel(`What's the character's name?`)
			.setStyle(this._styleMap[RemoveCharacterCustomIds.Name])
            .setMinLength(1)
            .setMaxLength(255)
            .setRequired(true);

        return [
            nameInput,
        ];
    }

    static async run(interaction: ModalSubmitInteraction)
    {
        // Send message to show the command was received
        await interaction.deferUpdate({
            fetchReply: true,
        });

        const tracker = this._inputData as Tracker;

        const data = this.parseInput<RemoveCharacterCustomIds>(interaction);

        await RollOfDarknessPseudoCache.deleteCharacter({
            tracker,
            characterName: data[RemoveCharacterCustomIds.Name] as string,
            interaction,
        });

        // Get components.
        const actionRows = getCombatTrackerActionRows({
            typeOfTracker: tracker.type,
            combatTrackerStatus: tracker.status,
        });

        // Get characters.
        const characters = await RollOfDarknessPseudoCache.getCharacters({ tracker });

        // Handle the components of the embed message.
        awaitCombatTrackerMessageComponents({
            message: interaction.message as Message,
            tracker,
        });

        // Update message.
        await updateCombatTrackerEmbedMessage({
            tracker,
            characters,
            interaction,
            actionRows,
        });
    }
}