import { SlashCommandStringOption } from 'discord.js';

export {
    numberOfDice,
    name,
    secret,
} from '../../options/roll.js';

export enum TwoSuccessesOption {
    TenAgain = 'ten_again',
    NineAgain = 'nine_again',
    NoAgain = 'no_again',
}

export function twoSuccesses(option: SlashCommandStringOption)
{
    option.setName('two_successes');
    option.setDescription('The minimum value that dice get two successes on (default: 10again)');
    option.addChoices(
        {
            name: '10again',
            value: TwoSuccessesOption.TenAgain,
        },
        {
            name: '9again',
            value: TwoSuccessesOption.NineAgain,
        },
        {
            name: 'noagain',
            value: TwoSuccessesOption.NoAgain,
        },
    );
    return option;
}
