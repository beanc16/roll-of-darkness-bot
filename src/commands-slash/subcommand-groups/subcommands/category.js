const options = require('./options');

function category(subcommand)
{
    subcommand.setName('category');
    subcommand.setDescription('Create category');
    subcommand.addStringOption(options.category);
    subcommand.addStringOption(options.categoryType);
    return subcommand;
}



module.exports = category;