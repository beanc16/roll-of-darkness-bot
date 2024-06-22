const FlavorTextService = require('../../services/FlavorTextService');
const { maxParams } = require('../../constants/roll');

function numberOfDice(option)
{
    option.setName('number_of_dice');
    option.setDescription('The number of dice to roll');
    option.setMinValue(1);
    option.setMaxValue(maxParams.numberOfDice);
    option.setRequired(true);
    return option;
}

function splat(option)
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

function name(option)
{
    option.setName('name');
    option.setDescription('The name/flavor text of the roll');
    option.setMinLength(1);
    option.setMaxLength(100);
    return option;
}

// TODO: Probably move this somewhere else later. Or ask Joel to update the API to take the values instead. Or update the values to match.
// For probability command
const rerollChoices = {
    '10again': 'ten_again',
    'ten_again': '10again',
    '9again': 'nine_again',
    'nine_again': '9again',
    '8again': 'eight_again',
    'eight_again': '8again',
    'noagain': 'no_again',
    'no_again': 'noagain',
};

function rerolls(option)
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

function rote(option)
{
    option.setName('rote');
    option.setDescription('Failed rolls are rerolled once (default: False)');
    return option;
}

function exceptionalOn(option)
{
    option.setName('exceptional_on');
    option.setDescription('The number of successes it takes to get an exceptional success (default: 5)');
    option.setMinValue(1);
    option.setMaxValue(maxParams.exceptionalOn);
    return option;
}

function diceToReroll(option)
{
    option.setName('dice_to_reroll');
    option.setDescription('The number of dice to reroll on reroll (default: 1)');
    option.setMinValue(1);
    option.setMaxValue(maxParams.diceToReroll);
    return option;
}

function extraSuccesses(option)
{
    option.setName('extra_successes');
    option.setDescription('The number of successes to add to your result - useful for weapon rating (default: 0)');
    option.setMinValue(1);
    option.setMaxValue(maxParams.extraSuccesses);
    return option;
}

function advancedAction(option)
{
    option.setName('advanced_action');
    option.setDescription('Roll the dice pool twice, take the higher result (default: False)');
    return option;
}

function secret(option, {
    commandType = 'roll',
} = {})
{
    option.setName('secret');
    option.setDescription(`Makes a temporary ${commandType} message that only you can see (default: false)`);
    return option;
}



module.exports = {
    numberOfDice,
    splat,
    name,
    rerollChoices,
    rerolls,
    rote,
    exceptionalOn,
    diceToReroll,
    extraSuccesses,
    advancedAction,
    secret,
};
