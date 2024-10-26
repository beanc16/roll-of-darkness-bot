import { SlashCommandIntegerOption, SlashCommandStringOption } from 'discord.js';

export {
    numberOfDice,
    name,
    secret,
} from '../../options/roll.js';

export enum TwoSuccessesOption {
    DoubleTens = 'double_10s',
    DoubleNines = 'double_9s',
    NoDoubles = 'no_doubles',
}

export function twoSuccesses(option: SlashCommandStringOption)
{
    option.setName('double_successes');
    option.setDescription('The minimum value that dice get two successes on (default: 10again)');
    option.addChoices(
        {
            name: 'double_10s',
            value: TwoSuccessesOption.DoubleTens,
        },
        {
            name: 'double_9s',
            value: TwoSuccessesOption.DoubleNines,
        },
        {
            name: 'no_doubles',
            value: TwoSuccessesOption.NoDoubles,
        },
    );
    return option;
}

export function enhancements(option: SlashCommandIntegerOption)
{
    option.setName('enhancements');
    option.setDescription('The number of enhancements to add to your result (default: 0)');
    option.setMinValue(0);
    option.setMaxValue(5);
    return option;
}
