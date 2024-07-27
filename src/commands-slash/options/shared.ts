import { SlashCommandStringOption } from 'discord.js';

export const equalityOption = (option: SlashCommandStringOption): SlashCommandStringOption =>
{
    return option.setChoices(
        {
            name: 'Equal',
            value: '===',
        },
        {
            name: 'Greater than or equal to',
            value: '>=',
        },
        {
            name: 'Greater than',
            value: '>',
        },
        {
            name: 'Less than or equal to',
            value: '<=',
        },
        {
            name: 'Less than',
            value: '<',
        },
        {
            name: 'Not equal to',
            value: '!==',
        },
    );
};