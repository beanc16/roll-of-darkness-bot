import { SlashCommandSubcommandGroupBuilder } from 'discord.js';

import * as generateSubcommands from './generate.js';

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
