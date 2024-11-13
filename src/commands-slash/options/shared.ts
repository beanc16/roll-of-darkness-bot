import { SlashCommandIntegerOption, SlashCommandStringOption } from 'discord.js';

export enum EqualityOption
{
    Equal = '===',
    GreaterThanOrEqualTo = '>=',
    GreaterThan = '>',
    LessThanOrEqualTo = '<=',
    LessThan = '<',
    NotEqualTo = '!==',
}

export const equalityOption = (option: SlashCommandStringOption): SlashCommandStringOption =>
{
    option.setChoices(
        {
            name: 'Equal',
            value: EqualityOption.Equal,
        },
        {
            name: 'Greater than or equal to',
            value: EqualityOption.GreaterThanOrEqualTo,
        },
        {
            name: 'Greater than',
            value: EqualityOption.GreaterThan,
        },
        {
            name: 'Less than or equal to',
            value: EqualityOption.LessThanOrEqualTo,
        },
        {
            name: 'Less than',
            value: EqualityOption.LessThan,
        },
        {
            name: 'Not equal to',
            value: EqualityOption.NotEqualTo,
        },
    );

    return option;
};

export const numberOfDice = (option: SlashCommandIntegerOption) =>
{
    option.setName('number_of_dice');
    option.setDescription('The number of dice to roll');
    option.setMinValue(1);
    option.setMaxValue(25);
    option.setRequired(true);
    return option;
};
