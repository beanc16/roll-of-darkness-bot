import { SlashCommandSubcommandBuilder } from 'discord.js';

import * as options from './options/index.js';

export function createCategory(subcommand: SlashCommandSubcommandBuilder)
{
    subcommand.setName('category');
    subcommand.setDescription('Create category');
    subcommand.addStringOption(options.category);
    subcommand.addStringOption(options.categoryType);
    return subcommand;
}
