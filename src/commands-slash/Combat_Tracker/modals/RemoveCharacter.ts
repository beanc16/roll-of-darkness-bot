import {
    Message,
    ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';
import { BaseCustomModal } from '../../../modals/BaseCustomModal.js';
import { RollOfDarknessPseudoCache } from '../dal/RollOfDarknessPseudoCache.js';
import { getCombatTrackerActionRows } from '../select-menus/combat_tracker.js';
import { updateCombatTrackerEmbedMessage } from '../embed-messages/combat_tracker.js';
import { awaitCombatTrackerMessageComponents } from '../message-component-handlers/combat_tracker.js';
import { Tracker } from '../dal/RollOfDarknessMongoControllers.js';
import stillWaitingForModalSingleton from '../../../models/stillWaitingForModalSingleton.js';

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
        // Set command as having started
        stillWaitingForModalSingleton.set(interaction.member?.user.id, false);
        
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
            user: interaction.user,
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