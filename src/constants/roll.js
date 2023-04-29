const defaultParams = {
    sides: 10,
    count: 1,
    rerollOnGreaterThanOrEqualTo: 10,
    successOnGreaterThanOrEqualTo: 8,
    isRote: false,
};

const rerollsEnum = {
    nine_again: {
        number: 9,
        display: '9again',
    },
    eight_again: {
        number: 8,
        display: '8again',
    },
    no_again: {
        number: 999, // Dice rolls will never be this big, so it will never be rerolled
        display: 'noagain',
    },
};



module.exports = {
    defaultParams,
    rerollsEnum,
};
