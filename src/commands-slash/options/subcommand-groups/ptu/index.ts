import { SlashCommandSubcommandGroupBuilder } from 'discord.js';
import * as randomSubcommands from './random';

export const random = (subcommandGroup: SlashCommandSubcommandGroupBuilder) =>
{
    subcommandGroup.setName('random');
    subcommandGroup.setDescription('Run PTU radomization commands.');
    subcommandGroup.addSubcommand(randomSubcommands.berry);
    return subcommandGroup;
};
