import {
    ActionRowBuilder,
    MessageComponentInteraction,
    ModalActionRowComponentBuilder,
    ModalBuilder,
    ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';
import { AddCharacterCustomIds } from './combat-tracker/AddCharacter';

interface InputValue
{
    key: string;
    label: string;
    value: string | number;
    typeOfValue: 'string' | 'integer' | 'boolean';
}

export abstract class BaseCustomModal
{
    protected static _id: string;
    protected static _title: string;
    protected static _inputValuesMap: Record<string, InputValue[]>;
    protected static _styleMap: Record<AddCharacterCustomIds, TextInputStyle>;

    static get id()
    {
        return this._id;
    }

    static get title()
    {
        return this._title;
    }

    static getTextInputs(): TextInputBuilder[]
    {
        return [];
    }

    static getInputValues(key: string): string
    {
        const inputValues = this._inputValuesMap[key];

        return inputValues.reduce((acc, cur, index) =>
        {
            acc += `${cur.label}${cur.value}`;

            // Add a line break between each input value, but not at the end
            if (index < inputValues.length - 1)
            {
                acc += '\n';
            }

            return acc;
        }, '');
    }

    static parseInputValues<KeyType extends string = string>(key: string, input: string): Record<KeyType, unknown>
    {
        const defaultInputValues = this._inputValuesMap[key];

        return input.split('\n').reduce((acc, cur, index) =>
        {
            const defaultInputValue = defaultInputValues[index];

            // Remove the label so all that remains is the value
            const value = cur.trim().replace(defaultInputValue.label, '');

            if (defaultInputValue.typeOfValue === 'integer')
            {
                acc[defaultInputValue.key as KeyType] = parseInt(value, 10);
            }
            else if (defaultInputValue.typeOfValue === 'boolean')
            {
                const booleanMap = {
                    yes: true,
                    no: false,
                };
                acc[defaultInputValue.key as KeyType] = booleanMap[
                    value.toLowerCase().trim() as 'yes' | 'no'
                ];
            }
            else if (defaultInputValue.typeOfValue === 'string')
            {
                acc[defaultInputValue.key as KeyType] = value;
            }

            return acc;
        }, {} as Record<KeyType, unknown>);
    }

    static getActionRows(): ActionRowBuilder<ModalActionRowComponentBuilder>[]
    {
        return this.getTextInputs().map((textInput) =>
        {
            return new ActionRowBuilder<ModalActionRowComponentBuilder>()
                .addComponents(textInput);
        })
    }

    static getModal(): ModalBuilder
    {
        const modal = new ModalBuilder()
            .setCustomId(this._id)
            .setTitle(this._title);

        const actionRows = this.getActionRows();
        modal.addComponents(actionRows);

        return modal;
    }

    static async showModal(interaction: MessageComponentInteraction): Promise<void>
    {
        const modal = this.getModal();
        await interaction.showModal(modal);
    }

    static parseInput<KeyType extends string = string>(interaction: ModalSubmitInteraction)
    {
        const {
            fields: {
                fields,
            } = {},
        } = interaction;

        const data = fields?.reduce((acc, {
            customId,
            value,
        }) => {
            // Parse paragraph input fields
            if (this._styleMap[customId as AddCharacterCustomIds] === TextInputStyle.Paragraph)
            {
                const map = this.parseInputValues<KeyType>(customId, value);
                acc[customId as KeyType] = map;
                return acc;
            }

            // Just return the original value for short input fields
            acc[customId as KeyType] = value;

            return acc;
        }, {} as Record<KeyType, Record<string, unknown> | string | number | boolean | undefined>);

        return data || {} as Record<KeyType, Record<string, unknown> | string | number | boolean | undefined>;
    }

    public static async run(_interaction: ModalSubmitInteraction)
    {
        throw new Error(`${this.constructor.name}.run has not yet been implemented`);
    }
}