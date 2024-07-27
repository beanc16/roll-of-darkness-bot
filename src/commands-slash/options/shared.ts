import { SlashCommandStringOption } from 'discord.js';

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
    return option.setChoices(
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
};