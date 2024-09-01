import { SlashCommandSubcommandGroupBuilder } from 'discord.js';

import * as subcommands from './subcommands/index.js';

export function getAll(subcommandGroup: SlashCommandSubcommandGroupBuilder)
{
    subcommandGroup.setName('get_all');
    subcommandGroup.setDescription('Get all data from the database');
    subcommandGroup.addSubcommand(subcommands.getAllCategories);
    subcommandGroup.addSubcommand(subcommands.getAllFlavorTexts);
    return subcommandGroup;
}
