const defaultParams = {
    sides: 10,
    count: 1,
    rerollOnGreaterThanOrEqualTo: 10,
    successOnGreaterThanOrEqualTo: 8,
    exceptionalOn: 5,
    isRote: false,
    isAdvancedAction: false,
};

const rerollsEnum = {
    ten_again: {
        number: 10,
        display: '10again',
        key: 'ten_again',
    },
    nine_again: {
        number: 9,
        display: '9again',
        key: 'nine_again',
    },
    eight_again: {
        number: 8,
        display: '8again',
        key: 'eight_again',
    },
    no_again: {
        number: 999, // Dice rolls will never be this big, so it will never be rerolled
        display: 'noagain',
        key: 'no_again',
    },
};

const defaultFlavorTextResults = [
    '#blamejoel.',
];



module.exports = {
    defaultFlavorTextResults,
    defaultParams,
    rerollsEnum,
};
