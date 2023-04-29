const defaultParams = {
    sides: 10,
    count: 1,
    rerollOnGreaterThanOrEqualTo: 10,
};

const rerollsEnum = {
    nine_again: 9,
    eight_again: 8,
    no_again: 999, // Dice rolls will never be this big, so it will never be rerolled
};



module.exports = {
    defaultParams,
    rerollsEnum,
};
