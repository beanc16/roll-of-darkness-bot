import { SlashCommandSubcommandGroupBuilder } from 'discord.js';

import * as subcommands from './subcommands/index.js';

export function get(subcommandGroup: SlashCommandSubcommandGroupBuilder)
{
    subcommandGroup.setName('get');
    subcommandGroup.setDescription('Get data from the database');
    subcommandGroup.addSubcommand(subcommands.getFlavorText);
    return subcommandGroup;
}
