const categoriesSingleton = require('../../../../../models/categoriesSingleton');

function categoryDropdown(option, categoryNumber = 1)
{
    option.setName(`category${categoryNumber}`);
    option.setDescription('The supernatural splat to get flavor text for (default: General)');
    return option.addChoices(
        ...categoriesSingleton.getAllAsStringOptionChoices(),
    );
}



module.exports = categoryDropdown;
