const subcommands = require('./subcommands');

function get(subcommandGroup)
{
    subcommandGroup.setName('get');
    subcommandGroup.setDescription('Get data from the database');
    subcommandGroup.addSubcommand(subcommands.getFlavorText);
    return subcommandGroup;
}



module.exports = get;
