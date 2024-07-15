import { SlashCommandSubcommandGroupBuilder } from 'discord.js';
import * as randomSubcommands from './random';

export enum PtuSubcommandGroup
{
    Random = 'random',
}

export const random = (subcommandGroup: SlashCommandSubcommandGroupBuilder) =>
{
    subcommandGroup.setName(PtuSubcommandGroup.Random);
    subcommandGroup.setDescription('Run PTU radomization commands.');
    subcommandGroup.addSubcommand(randomSubcommands.berry);
    subcommandGroup.addSubcommand(randomSubcommands.evolutionaryStones);
    subcommandGroup.addSubcommand(randomSubcommands.xItem);
    subcommandGroup.addSubcommand(randomSubcommands.tm);
    subcommandGroup.addSubcommand(randomSubcommands.vitamin);
    return subcommandGroup;
};
