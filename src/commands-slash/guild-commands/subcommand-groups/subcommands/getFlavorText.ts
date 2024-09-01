import { SlashCommandSubcommandBuilder } from 'discord.js';

import * as options from './options/index.js';

export function getFlavorText(subcommand: SlashCommandSubcommandBuilder)
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
