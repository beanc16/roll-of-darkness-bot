const numberOfDice = function (option)
{
    option.setName('number_of_dice');
    option.setDescription('The number of dice to roll (default: 1)');
    option.setMinValue(1);
    option.setMaxValue(100);
    return option;
};

const rerolls = function (option)
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
};

const rote = function (option)
{
    option.setName('rote');
    option.setDescription('Failed rolls are rerolled once (default: False)');
    return option;
}

const exceptionalOn = function (option)
{
    option.setName('exceptional_on');
    option.setDescription('The number of successes it takes to get an exceptional success (default: 5)');
    option.setMinValue(1);
    option.setMaxValue(10);
    return option;
};

const extraSuccesses = function (option)
{
    option.setName('extra_successes');
    option.setDescription('The number of successes to add to your result - useful for weapon rating (default: 0)');
    option.setMinValue(1);
    option.setMaxValue(30);
    return option;
};

const advancedAction = function (option)
{
    option.setName('advanced_action');
    option.setDescription('Roll the dice pool twice, take the higher result (default: False)');
    return option;
};

const secret = function (option)
{
    option.setName('secret');
    option.setDescription('Makes a temporary roll message that only you can see (default: false)');
    return option;
};



module.exports = {
    numberOfDice,
    rerolls,
    rote,
    exceptionalOn,
    extraSuccesses,
    advancedAction,
    secret,
};