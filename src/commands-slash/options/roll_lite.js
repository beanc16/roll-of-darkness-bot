function dicePool(option)
{
    option.setName('dice_pool');
    option.setDescription('A mathematical formula of dice to roll (only addition and subtraction are supported; IE: 2d6 + 3d4)');
    option.setMinLength(1);
    option.setRequired(true);
    return option;
}



module.exports = {
    dicePool,
};
