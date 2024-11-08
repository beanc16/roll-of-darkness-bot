import { SlashCommandSubcommandBuilder } from 'discord.js';

import * as options from './options/index.js';

export function createFlavorText(subcommand: SlashCommandSubcommandBuilder)
{
    subcommand.setName('flavor_text');
    subcommand.setDescription('Create flavor text');
    subcommand.addStringOption(options.flavorText);
    subcommand.addIntegerOption(options.diceCount);
    subcommand.addStringOption((option) => options.categoryDropdown(option, 1));
    subcommand.addStringOption((option) => options.categoryDropdown(option, 2));
    return subcommand;
}
