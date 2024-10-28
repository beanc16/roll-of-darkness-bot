import { SlashCommandBooleanOption, SlashCommandIntegerOption, SlashCommandStringOption } from 'discord.js';

import FlavorTextService from '../../../services/FlavorTextService.js';
import rollConstants from '../../../constants/roll.js';

export function numberOfDice(option: SlashCommandStringOption)
{
    option.setName('number_of_dice');
    option.setDescription('A mathematical formula of dice to roll (only addition and subtraction are supported; IE: 4 + 3 - 2).');
    option.setRequired(true);
    return option;
}

export function splat(option: SlashCommandStringOption)
{
    const flavorTextService = new FlavorTextService();

    option.setName('splat');
    option.setDescription('The supernatural splat to get flavor text for (default: General)');
    option.addChoices(
        ...flavorTextService.getAllCategoriesAsStringOptionChoices({
            type: 'Splat',
        }),
    );
    return option;
}

export function name(option: SlashCommandStringOption)
{
    option.setName('name');
    option.setDescription('The name/flavor text of the roll');
    option.setMinLength(1);
    option.setMaxLength(100);
    return option;
}

// TODO: Probably move this somewhere else later. Or ask Joel to update the API to take the values instead. Or update the values to match.
// For probability command
export const rerollChoices = {
    '10again': 'ten_again',
    'ten_again': '10again',
    '9again': 'nine_again',
    'nine_again': '9again',
    '8again': 'eight_again',
    'eight_again': '8again',
    'noagain': 'no_again',
    'no_again': 'noagain',
};

export function rerolls(option: SlashCommandStringOption)
{
    option.setName('rerolls');
    option.setDescription('The minimum value that dice reroll on (default: 10again)');
    option.addChoices(
        {
            name: '10again',
            value: 'ten_again',
        },
        {
            name: '9again',
            value: 'nine_again',
        },
        {
            name: '8again',
            value: 'eight_again',
        },
        {
            name: 'noagain',
            value: 'no_again',
        },
    );
    return option;
}

export function rote(option: SlashCommandBooleanOption)
{
    option.setName('rote');
    option.setDescription('Failed rolls are rerolled once (default: False)');
    return option;
}

export function exceptionalOn(option: SlashCommandIntegerOption)
{
    option.setName('exceptional_on');
    option.setDescription('The number of successes it takes to get an exceptional success (default: 5)');
    option.setMinValue(1);
    option.setMaxValue(rollConstants.maxParams.exceptionalOn);
    return option;
}

export function diceToReroll(option: SlashCommandIntegerOption)
{
    option.setName('dice_to_reroll');
    option.setDescription('The number of dice to reroll on reroll (default: 1)');
    option.setMinValue(1);
    option.setMaxValue(rollConstants.maxParams.diceToReroll);
    return option;
}

export function extraSuccesses(option: SlashCommandIntegerOption)
{
    option.setName('extra_successes');
    option.setDescription('The number of successes to add to your result - useful for weapon rating (default: 0)');
    option.setMinValue(1);
    option.setMaxValue(rollConstants.maxParams.extraSuccesses);
    return option;
}

export function advancedAction(option: SlashCommandBooleanOption)
{
    option.setName('advanced_action');
    option.setDescription('Roll the dice pool twice, take the higher result (default: False)');
    return option;
}

export function secret(option: SlashCommandBooleanOption, {
    commandType = 'roll',
} = {})
{
    option.setName('secret');
    option.setDescription(`Makes a temporary ${commandType} message that only you can see (default: false)`);
    return option;
}
