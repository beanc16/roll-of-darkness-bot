const categoriesSingleton = require('../../models/categoriesSingleton');
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
    option.setName('splat');
    option.setDescription('The supernatural splat to get flavor text for (default: General)');
    option.addChoices(
        ...categoriesSingleton.getAllAsStringOptionChoices({
            type: 'Splat',
        }),
    );
    return option;
}

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

function secret(option)
{
    option.setName('secret');
    option.setDescription('Makes a temporary roll message that only you can see (default: false)');
    return option;
}



module.exports = {
    numberOfDice,
    splat,
    rerolls,
    rote,
    exceptionalOn,
    extraSuccesses,
    advancedAction,
    secret,
};
