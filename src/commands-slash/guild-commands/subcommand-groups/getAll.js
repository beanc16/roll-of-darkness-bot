const subcommands = require('./subcommands');

function getAll(subcommandGroup)
{
    subcommandGroup.setName('get_all');
    subcommandGroup.setDescription('Get all data from the database');
    subcommandGroup.addSubcommand(subcommands.getAllCategories);
    subcommandGroup.addSubcommand(subcommands.getAllFlavorTexts)
    return subcommandGroup;
}



module.exports = getAll;
