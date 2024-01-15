import {
    ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';
import { BaseCustomModal } from '../BaseCustomModal';

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

    static getTextInputs(): TextInputBuilder[]
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
            initiativeInput,
            hpInput,
            secretsInput,
        ];
    }

    static async run(interaction: ModalSubmitInteraction)
    {
        console.log('AddCharacter modal handler', interaction);

        const data = this.parseInput<AddCharacterCustomIds>(interaction);
        console.log('\n data:', data);
    }
}