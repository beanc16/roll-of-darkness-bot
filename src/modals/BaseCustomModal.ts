import {
    ActionRowBuilder,
    MessageComponentInteraction,
    ModalActionRowComponentBuilder,
    ModalBuilder,
    ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';

interface InputValue
{
    key: string;
    label?: string;
    value: string | number;
    typeOfValue: 'string' | 'integer' | 'boolean';
}

export type InputValuesMap = Record<string, InputValue[]>;

export abstract class BaseCustomModal
{
    public static id: string;
    public static title: string;
    protected static inputValuesMap: InputValuesMap;
    protected static styleMap: Record<string, TextInputStyle>;
    protected static inputData: unknown;

    public static getTextInputs<TextInputParamaters = object>(_data?: TextInputParamaters): TextInputBuilder[]
    {
        return [];
    }

    public static getInputValues(key: string): string
    {
        const inputValues = this.inputValuesMap[key];

        return inputValues.reduce((acc, cur, index) =>
        {
            // Add a line break between each input value, but not on the last value
            const endingLineBreak = (index < inputValues.length - 1)
                ? '\n'
                : '';

            return acc + `${cur.label || ''} ${cur.value}${endingLineBreak}`;
        }, '');
    }

    protected static parseInputValue(defaultInputValue: InputValue, value: string): number | boolean | string
    {
        if (defaultInputValue.typeOfValue === 'integer')
        {
            return parseInt(value, 10);
        }

        if (defaultInputValue.typeOfValue === 'boolean')
        {
            const booleanMap = {
                yes: true,
                no: false,
            };

            return booleanMap[
                value.toLowerCase().trim() as 'yes' | 'no'
            ];
        }

        // string
        return value;
    }

    public static parseInputValues<KeyType extends string = string>(key: string, input: string): Record<KeyType, unknown>
    {
        const defaultInputValues = this.inputValuesMap[key];

        return input.split('\n').reduce((acc, cur, index) =>
        {
            const defaultInputValue = defaultInputValues[index];

            // Remove the label so all that remains is the value
            const value = cur.trim().replace(defaultInputValue.label || '', '');

            acc[defaultInputValue.key as KeyType] = this.parseInputValue(
                defaultInputValue,
                value,
            );

            return acc;
        }, {} as Record<KeyType, unknown>);
    }

    public static getActionRows<TextInputParamaters = object>(data?: TextInputParamaters): ActionRowBuilder<ModalActionRowComponentBuilder>[]
    {
        return this.getTextInputs<TextInputParamaters>(data).map(textInput =>
            new ActionRowBuilder<ModalActionRowComponentBuilder>()
                .addComponents(textInput));
    }

    public static getModal<TextInputParamaters = object>(data?: TextInputParamaters): ModalBuilder
    {
        const modal = new ModalBuilder()
            .setCustomId(this.id)
            .setTitle(this.title);

        const actionRows = this.getActionRows<TextInputParamaters>(data);
        modal.addComponents(actionRows);

        return modal;
    }

    public static async showModal<TextInputParamaters = object>(interaction: MessageComponentInteraction, data?: TextInputParamaters): Promise<void>
    {
        this.inputData = data;
        const modal = this.getModal<TextInputParamaters>(data);
        await interaction.showModal(modal);
    }

    public static parseInput<KeyType extends string = string>(interaction: ModalSubmitInteraction): Record<KeyType, string | number | boolean | Record<string, unknown> | undefined>
    {
        // TODO: Add way to handle invalid inputted data. Probably with JOI schemas.
        const {
            fields: {
                fields,
            } = {},
        } = interaction;

        const data = fields?.reduce((acc, { customId, value }) =>
        {
            // Parse paragraph input fields
            if (this.styleMap[customId] === TextInputStyle.Paragraph)
            {
                const map = this.parseInputValues<KeyType>(customId, value);
                acc[customId as KeyType] = map;
                return acc;
            }

            // Parse short input fields
            acc[customId as KeyType] = this.parseInputValue(
                this.inputValuesMap[customId][0],
                value,
            );

            return acc;
        }, {} as Record<KeyType, Record<string, unknown> | string | number | boolean | undefined>);

        return data || {} as Record<KeyType, Record<string, unknown> | string | number | boolean | undefined>;
    }

    public static run(_interaction: ModalSubmitInteraction): Promise<void>
    {
        throw new Error(`${this.constructor.name}.run has not yet been implemented`);
    }
}
