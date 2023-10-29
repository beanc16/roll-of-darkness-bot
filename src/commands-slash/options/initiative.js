function initiativeModifier(option)
{
    option.setName('initiative_modifier');
    option.setDescription('A mathematical formula to add to the result (only addition and subtraction are supported; IE: 4+3-2)');
    option.setMinLength(0);
    option.setMaxLength(100);
    option.setRequired(true);
    return option;
}



module.exports = {
    initiativeModifier,
};
