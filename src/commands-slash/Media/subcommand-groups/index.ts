import { SlashCommandSubcommandGroupBuilder } from 'discord.js';

import * as imageSubcommands from './image.js';
import * as instagramSubcommands from './instagram.js';

export enum MediaSubcommandGroup
{
    Image = 'image',
    Instagram = 'instagram',
}

export const image = (subcommandGroup: SlashCommandSubcommandGroupBuilder) =>
{
    subcommandGroup.setName(MediaSubcommandGroup.Image);
    subcommandGroup.setDescription('Run Image commands.');
    subcommandGroup.addSubcommand(imageSubcommands.background);
    subcommandGroup.addSubcommand(imageSubcommands.upscale);
    return subcommandGroup;
};

export const instagram = (subcommandGroup: SlashCommandSubcommandGroupBuilder) =>
{
    subcommandGroup.setName(MediaSubcommandGroup.Instagram);
    subcommandGroup.setDescription('Run Instagram commands.');
    subcommandGroup.addSubcommand(instagramSubcommands.download);
    return subcommandGroup;
};
