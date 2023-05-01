const subcommands = require('./subcommands');

function create(subcommandGroup)
{
    subcommandGroup.setName('create');
    subcommandGroup.setDescription('Add data to the database');
    subcommandGroup.addSubcommand(subcommands.createCategory);
    subcommandGroup.addSubcommand(subcommands.createFlavorText);
    return subcommandGroup;
}



module.exports = create;
