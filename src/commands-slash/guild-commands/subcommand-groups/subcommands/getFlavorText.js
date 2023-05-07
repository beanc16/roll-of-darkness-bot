const options = require('./options');

function getFlavorText(subcommand)
{
    subcommand.setName('flavor_text');
    subcommand.setDescription('Get flavor text');
    subcommand.addStringOption((option) => options.categoryDropdown(option, 1, {
        parameterName: 'splat',
        type: 'Splat',
    }));
    subcommand.addStringOption((option) => options.categoryDropdown(option, 1, {
        notType: 'Splat',
    }));
    subcommand.addStringOption((option) => options.categoryDropdown(option, 2, {
        notType: 'Splat',
    }));
    return subcommand;
}



module.exports = getFlavorText;