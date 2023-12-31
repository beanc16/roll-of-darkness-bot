const categoriesSingleton = require('../../../../../models/categoriesSingleton');

function categoryDropdown(option, categoryNumber = 1, {
    parameterName,
    type,
    notType,
} = {})
{
    const description = (parameterName === 'splat')
        ? 'The supernatural splat to get flavor text for (default: General)'
        : 'The non-splat category to get flavor text for';

    option.setName(parameterName || `category${categoryNumber}`);
    option.setDescription(description);
    return option.addChoices(
        ...categoriesSingleton.getAllAsStringOptionChoices({
            ...(type !== undefined && { type }),
            ...(notType !== undefined && { notType }),
        }),
    );
}



module.exports = categoryDropdown;