const options = require('./options');

function createFlavorText(subcommand)
{
    subcommand.setName('flavor_text');
    subcommand.setDescription('Create flavor text');
    subcommand.addStringOption(options.flavorText);
    subcommand.addIntegerOption(options.diceCount);
    subcommand.addStringOption((option) => options.categoryDropdown(option, 1));
    subcommand.addStringOption((option) => options.categoryDropdown(option, 2));
    return subcommand;
}



module.exports = createFlavorText;