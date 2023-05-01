const options = require('./options');

function createCategory(subcommand)
{
    subcommand.setName('category');
    subcommand.setDescription('Create category');
    subcommand.addStringOption(options.category);
    subcommand.addStringOption(options.categoryType);
    return subcommand;
}



module.exports = createCategory;