/* eslint-disable import/no-cycle */ // TODO: Fix this later.
import {
    Message,
    ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';

import { BaseCustomModal, InputValuesMap } from '../../../modals/BaseCustomModal.js';
import stillWaitingForModalSingleton from '../../../models/stillWaitingForModalSingleton.js';
import { InitiativeStrategy } from '../../Nwod/strategies/InitiativeStrategy.js';
import { RollOfDarknessPseudoCache } from '../dal/RollOfDarknessPseudoCache.js';
import { Tracker } from '../dal/types/Tracker.js';
import { updateCombatTrackerEmbedMessage } from '../embed-messages/combat_tracker.js';
import { awaitCombatTrackerMessageComponents } from '../message-component-handlers/combat_tracker.js';
import { getCombatTrackerActionRows } from '../select-menus/combat_tracker.js';
import { CombatTrackerType } from '../types.js';

export enum AddCharacterCustomIds
{
    Name = 'name-text-input',
    Initiative = 'initiative-text-input',
    ShouldRollInitiativeAsModifier = 'initiative-boolean-input',
    Hp = 'hp-text-input',
    Secrets = 'secrets-text-input',
}

export class AddCharacterModal extends BaseCustomModal
{
    public static id = 'add-character-modal';
    public static title = 'Add Character';
    protected static inputValuesMap: InputValuesMap = {
        [AddCharacterCustomIds.Hp]: [
            {
                key: 'maxHp',
                label: 'Max HP: ',
                value: 6,
                typeOfValue: 'integer',
            },
            {
                key: 'bashingDamage',
                label: 'Bashing Damage: ',
                value: 0,
                typeOfValue: 'integer',
            },
            {
                key: 'lethalDamage',
                label: 'Lethal Damage: ',
                value: 0,
                typeOfValue: 'integer',
            },
            {
                key: 'aggravatedDamage',
                label: 'Aggravated Damage: ',
                value: 0,
                typeOfValue: 'integer',
            },
        ],
        [AddCharacterCustomIds.Secrets]: [
            {
                key: 'nameIsSecret',
                label: 'Name: ',
                value: 'no',
                typeOfValue: 'boolean',
            },
            {
                key: 'initiativeIsSecret',
                label: 'Initiative: ',
                value: 'no',
                typeOfValue: 'boolean',
            },
            {
                key: 'hpIsSecret',
                label: 'HP: ',
                value: 'no',
                typeOfValue: 'boolean',
            },
        ],
    };

    protected static styleMap = {
        [AddCharacterCustomIds.Name]: TextInputStyle.Short,
        [AddCharacterCustomIds.Initiative]: TextInputStyle.Short,
        [AddCharacterCustomIds.ShouldRollInitiativeAsModifier]: TextInputStyle.Short,
        [AddCharacterCustomIds.Hp]: TextInputStyle.Paragraph,
        [AddCharacterCustomIds.Secrets]: TextInputStyle.Paragraph,
    };

    public static getTextInputs<TextInputParamaters = Tracker>(input: TextInputParamaters): TextInputBuilder[]
    {
        const tracker = input as Tracker | undefined;
        const type = tracker?.type;

        const nameInput = new TextInputBuilder()
            .setCustomId(AddCharacterCustomIds.Name)
            .setLabel(`What's the character's name?`)
            .setStyle(this.styleMap[AddCharacterCustomIds.Name])
            .setMinLength(1)
            .setMaxLength(255)
            .setRequired(true);

        const initiativeInput = new TextInputBuilder()
            .setCustomId(AddCharacterCustomIds.Initiative)
            .setLabel(`What's their initiative? (number)`)
            .setStyle(this.styleMap[AddCharacterCustomIds.Initiative])
            .setMinLength(1)
            .setMaxLength(3)
            .setRequired(false);

        const shouldRollInitiativeAsModifierInput = new TextInputBuilder()
            .setCustomId(AddCharacterCustomIds.ShouldRollInitiativeAsModifier)
            .setLabel(`Should the initiative be rolled? (yes/no)`)
            .setStyle(this.styleMap[AddCharacterCustomIds.ShouldRollInitiativeAsModifier])
            .setMinLength(2)
            .setMaxLength(3)
            .setRequired(false)
            .setValue('no');

        const hpInput = new TextInputBuilder()
            .setCustomId(AddCharacterCustomIds.Hp)
            .setLabel(`What's their HP and current damage? (numbers)`)
            .setStyle(this.styleMap[AddCharacterCustomIds.Hp])
            .setMinLength(1)
            .setMaxLength(100)
            .setRequired(false)
            .setValue(
                this.getInputValues(AddCharacterCustomIds.Hp),
            );

        const secretsInput = new TextInputBuilder()
            .setCustomId(AddCharacterCustomIds.Secrets)
            .setLabel(`Which of these should be secret? (yes/no)`)
            .setStyle(this.styleMap[AddCharacterCustomIds.Secrets])
            .setMinLength(1)
            .setMaxLength(100)
            .setRequired(false)
            .setValue(
                this.getInputValues(AddCharacterCustomIds.Secrets),
            );

        return [
            nameInput,
            ...((!type || type === CombatTrackerType.All || type === CombatTrackerType.Initiative)
                ? [initiativeInput, shouldRollInitiativeAsModifierInput]
                : []
            ),
            ...((!type || type === CombatTrackerType.All || type === CombatTrackerType.Hp)
                ? [hpInput]
                : []
            ),
            secretsInput,
        ];
    }

    private static parseInitiative(data: Record<AddCharacterCustomIds, string | number | boolean | Record<string, unknown> | undefined>): number | undefined
    {
        const shouldRollInitiativeAsModifierInput = data[AddCharacterCustomIds.ShouldRollInitiativeAsModifier] as string | undefined;
        const initiativeModifier = data[AddCharacterCustomIds.Initiative] as string | undefined;

        let initiative: number | undefined;

        if (shouldRollInitiativeAsModifierInput?.toLowerCase() === 'yes' && initiativeModifier)
        {
            initiative = InitiativeStrategy.rollWithModifier(
                parseInt(initiativeModifier, 10),
            );
        }

        else if (initiativeModifier)
        {
            initiative = parseInt(initiativeModifier, 10);
        }

        return initiative;
    }

    public static async run(interaction: ModalSubmitInteraction): Promise<void>
    {
        // Set command as having started
        stillWaitingForModalSingleton.set(interaction.member?.user.id, false);

        // Send message to show the command was received
        await interaction.deferUpdate({
            fetchReply: true,
        });

        const data = this.parseInput<AddCharacterCustomIds>(interaction);
        const initiative = this.parseInitiative(data);

        const {
            tracker,
        } = await RollOfDarknessPseudoCache.createCharacter({
            characterName: data[AddCharacterCustomIds.Name] as string,
            ...(initiative && {
                initiative,
            }),
            ...(data[AddCharacterCustomIds.Hp] && {
                maxHp: (data[AddCharacterCustomIds.Hp] as Record<string, unknown>).maxHp as number,
                bashingDamage: (data[AddCharacterCustomIds.Hp] as Record<string, unknown>).bashingDamage as number,
                lethalDamage: (data[AddCharacterCustomIds.Hp] as Record<string, unknown>).lethalDamage as number,
                aggravatedDamage: (data[AddCharacterCustomIds.Hp] as Record<string, unknown>).aggravatedDamage as number,
            }),
            nameIsSecret: (data[AddCharacterCustomIds.Secrets] as Record<string, unknown>).nameIsSecret as boolean,
            initiativeIsSecret: (data[AddCharacterCustomIds.Secrets] as Record<string, unknown>).initiativeIsSecret as boolean,
            hpIsSecret: (data[AddCharacterCustomIds.Secrets] as Record<string, unknown>).hpIsSecret as boolean,
            interaction,
            message: interaction.message as Message,
            tracker: this.inputData as Tracker,
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
