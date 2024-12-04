/* eslint-disable import/no-cycle */ // TODO: Fix this later.
import {
    Message,
    ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';

import { BaseCustomModal } from '../../../modals/BaseCustomModal.js';
import stillWaitingForModalSingleton from '../../../models/stillWaitingForModalSingleton.js';
import { RollOfDarknessPseudoCache } from '../dal/RollOfDarknessPseudoCache.js';
import { Tracker } from '../dal/types/Tracker.js';
import { updateCombatTrackerEmbedMessage } from '../embed-messages/combat_tracker.js';
import { awaitCombatTrackerMessageComponents } from '../message-component-handlers/combat_tracker.js';
import { getCombatTrackerActionRows } from '../select-menus/combat_tracker.js';

export enum RemoveCharacterCustomIds
{
    Name = 'name-text-input',
}

export class RemoveCharacterModal extends BaseCustomModal
{
    public static id = 'remove-character-modal';
    public static title = 'Remove Character';
    protected static inputValuesMap = {};
    protected static styleMap = {
        [RemoveCharacterCustomIds.Name]: TextInputStyle.Short,
    };

    public static getTextInputs(): TextInputBuilder[]
    {
        const nameInput = new TextInputBuilder()
            .setCustomId(RemoveCharacterCustomIds.Name)
            .setLabel(`What's the character's name?`)
            .setStyle(this.styleMap[RemoveCharacterCustomIds.Name])
            .setMinLength(1)
            .setMaxLength(255)
            .setRequired(true);

        return [
            nameInput,
        ];
    }

    public static async run(interaction: ModalSubmitInteraction): Promise<void>
    {
        // Set command as having started
        stillWaitingForModalSingleton.upsert(interaction.member?.user.id, false);

        // Send message to show the command was received
        await interaction.deferUpdate({
            fetchReply: true,
        });

        const tracker = this.inputData as Tracker;

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
