import { SlashCommandSubcommandGroupBuilder } from 'discord.js';

import * as generateSubcommands from './generate.js';
import * as generateDevSubcommands from './generate_dev.js';

export enum AiSubcommandGroup
{
    Generate = 'generate',
}

export const generate = (subcommandGroup: SlashCommandSubcommandGroupBuilder): SlashCommandSubcommandGroupBuilder =>
{
    subcommandGroup.setName(AiSubcommandGroup.Generate);
    subcommandGroup.setDescription('Run Generate commands.');
    Object.values(generateSubcommands).forEach((subcommand) =>
    {
        if (typeof subcommand === 'function')
        {
            subcommandGroup.addSubcommand(subcommand);
        }
    });
    return subcommandGroup;
};

export const generateDev = (subcommandGroup: SlashCommandSubcommandGroupBuilder): SlashCommandSubcommandGroupBuilder =>
{
    subcommandGroup.setName(AiSubcommandGroup.Generate);
    subcommandGroup.setDescription('Run Generate commands.');
    Object.values(generateDevSubcommands).forEach((subcommand) =>
    {
        if (typeof subcommand === 'function')
        {
            subcommandGroup.addSubcommand(subcommand);
        }
    });
    return subcommandGroup;
};
