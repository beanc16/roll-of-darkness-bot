import { SlashCommandSubcommandGroupBuilder } from 'discord.js';

import * as subcommands from './subcommands/index.js';

export function create(subcommandGroup: SlashCommandSubcommandGroupBuilder)
{
    subcommandGroup.setName('create');
    subcommandGroup.setDescription('Add data to the database');
    subcommandGroup.addSubcommand(subcommands.createCategory);
    subcommandGroup.addSubcommand(subcommands.createFlavorText);
    return subcommandGroup;
}
