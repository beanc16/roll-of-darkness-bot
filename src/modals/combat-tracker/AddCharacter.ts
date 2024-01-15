import {
    Message,
    ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';
import { BaseCustomModal } from '../BaseCustomModal';
import initiativeCommand from '../../commands-slash/Initiative';
import { RollOfDarknessPseudoCache } from '../../dal/RollOfDarknessPseudoCache';
import { getCombatTrackerActionRows } from '../../commands-slash/select-menus/combat_tracker';
import { updateCombatTrackerEmbedMessage } from '../../commands-slash/embed-messages/combat_tracker';
import { awaitCombatTrackerMessageComponents } from '../../commands-slash/message-component-handlers/combat_tracker';
import { CombatTrackerType } from '../../constants/combatTracker';

export enum AddCharacterCustomIds
{
    Name = 'name-text-input',
    Initiative = 'initiative-text-input',
    Hp = 'hp-text-input',
    Secrets = 'secrets-text-input',
}

export class AddCharacterModal extends BaseCustomModal
{
    static {
        this._id = 'add-character-modal';
        this._title = 'Add Character';
        this._inputValuesMap = {
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
        this._styleMap = {
            [AddCharacterCustomIds.Name]: TextInputStyle.Short,
            [AddCharacterCustomIds.Initiative]: TextInputStyle.Short,
            [AddCharacterCustomIds.Hp]: TextInputStyle.Paragraph,
            [AddCharacterCustomIds.Secrets]: TextInputStyle.Paragraph,
        };
    }

    static getTextInputs<TextInputParamaters = CombatTrackerType>(type: TextInputParamaters): TextInputBuilder[]
    {
        const nameInput = new TextInputBuilder()
			.setCustomId(AddCharacterCustomIds.Name)
			.setLabel(`What's the character's name?`)
			.setStyle(this._styleMap[AddCharacterCustomIds.Name])
            .setMinLength(1)
            .setMaxLength(255)
            .setRequired(true);

        const initiativeInput = new TextInputBuilder()
            .setCustomId(AddCharacterCustomIds.Initiative)
            .setLabel(`What's their initiative modifier? (number)`)
            .setStyle(this._styleMap[AddCharacterCustomIds.Initiative])
            .setMinLength(1)
            .setMaxLength(3)
            .setRequired(false);

        const hpInput = new TextInputBuilder()
            .setCustomId(AddCharacterCustomIds.Hp)
            .setLabel(`What's their HP and current damage? (numbers)`)
            .setStyle(this._styleMap[AddCharacterCustomIds.Hp])
            .setMinLength(1)
            .setMaxLength(100)
            .setRequired(false)
            .setValue(
                this.getInputValues(AddCharacterCustomIds.Hp)
            );

        const secretsInput = new TextInputBuilder()
            .setCustomId(AddCharacterCustomIds.Secrets)
            .setLabel(`Which of these should be secret? (yes/no)`)
            .setStyle(this._styleMap[AddCharacterCustomIds.Secrets])
            .setMinLength(1)
            .setMaxLength(100)
            .setRequired(false)
            .setValue(
                this.getInputValues(AddCharacterCustomIds.Secrets)
            );

        return [
            nameInput,
            ...((!type || type === CombatTrackerType.All || type === CombatTrackerType.Initiative)
                ? [initiativeInput]
                : []
            ),
            ...((!type || type === CombatTrackerType.All || type === CombatTrackerType.Hp)
                ? [hpInput]
                : []
            ),
            secretsInput,
        ];
    }

    static async run(interaction: ModalSubmitInteraction)
    {
        const data = this.parseInput<AddCharacterCustomIds>(interaction);

        const initiativeModifier = data[AddCharacterCustomIds.Initiative] as string | undefined;
        const initiative = (initiativeModifier)
            ? initiativeCommand.rollWithModifier(
                parseInt(initiativeModifier, 10)
            ) as number
            : undefined;

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
        });

        // Get components.
        const actionRows = getCombatTrackerActionRows({
            typeOfTracker: tracker.type,
            combatTrackerStatus: tracker.status,
        });

        // Get characters.
        const characters = RollOfDarknessPseudoCache.getCharacters({ tracker });

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