import { SlashCommandSubcommandGroupBuilder } from 'discord.js';
import * as instagramSubcommands from './instagram.js';

export enum MediaSubcommandGroup
{
    Instagram = 'instagram',
}

export const instagram = (subcommandGroup: SlashCommandSubcommandGroupBuilder) =>
{
    subcommandGroup.setName(MediaSubcommandGroup.Instagram);
    subcommandGroup.setDescription('Run Instagram commands.');
    subcommandGroup.addSubcommand(instagramSubcommands.download);
    return subcommandGroup;
};