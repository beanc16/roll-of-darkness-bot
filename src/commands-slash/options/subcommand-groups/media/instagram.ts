import { SlashCommandStringOption, SlashCommandSubcommandBuilder } from 'discord.js';

export enum MediaInstagramSubcommand
{
    Download = 'download',
}

const instagramPostUrlOption = (option: SlashCommandStringOption, index: number, isRequired: boolean = false) =>
{
    option.setName(`url_${index}`);
    option.setDescription('A URL of an instagram post.');
    return option.setRequired(isRequired);
};

export const download = (subcommand: SlashCommandSubcommandBuilder) =>
{
    subcommand.setName(MediaInstagramSubcommand.Download);
    subcommand.setDescription('Get a list of images to download based on the given post urls.');

    // URLs
    subcommand.addStringOption((option) => instagramPostUrlOption(option, 1, true));
    subcommand.addStringOption((option) => instagramPostUrlOption(option, 2));
    subcommand.addStringOption((option) => instagramPostUrlOption(option, 3));
    subcommand.addStringOption((option) => instagramPostUrlOption(option, 4));
    subcommand.addStringOption((option) => instagramPostUrlOption(option, 5));
    subcommand.addStringOption((option) => instagramPostUrlOption(option, 6));
    subcommand.addStringOption((option) => instagramPostUrlOption(option, 7));
    subcommand.addStringOption((option) => instagramPostUrlOption(option, 8));
    subcommand.addStringOption((option) => instagramPostUrlOption(option, 9));
    subcommand.addStringOption((option) => instagramPostUrlOption(option, 10));

    return subcommand;
};
