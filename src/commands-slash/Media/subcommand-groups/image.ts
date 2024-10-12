import { FileStorageMicroserviceImageBackground } from '@beanc16/microservices-abstraction';
import { APIApplicationCommandOptionChoice, SlashCommandAttachmentOption, SlashCommandStringOption, SlashCommandSubcommandBuilder } from 'discord.js';

export enum MediaImageSubcommand
{
    Background = 'background',
    Upscale = 'upscale',
}

const imageOption = (option: SlashCommandAttachmentOption) =>
{
    option.setName('image');
    return option.setDescription('An image. This will take precedence over image_url.');
};

const imageUrlOption = (option: SlashCommandStringOption) =>
{
    option.setName('image_url');
    return option.setDescription('The URL of an image.');
};

const fileNameOption = (option: SlashCommandStringOption) =>
{
    option.setName('file_name');
    return option.setDescription('The name to give the image file.');
};

const baseImageSubcommand = (subcommand: SlashCommandSubcommandBuilder) => {
    subcommand.addAttachmentOption(imageOption);
    subcommand.addStringOption(imageUrlOption);
    return subcommand.addStringOption(fileNameOption);
};

export const background = (subcommand: SlashCommandSubcommandBuilder) => {
    subcommand.setName('background');
    subcommand.setDescription("Change the image's background color.");

    baseImageSubcommand(subcommand);
    subcommand.addStringOption((option) => {
        option.setName('color');
        option.setDescription("The image's background color. This will take precedence over hex_code.");

        const backgroundColorOptions = Object.entries(FileStorageMicroserviceImageBackground).map<APIApplicationCommandOptionChoice<string>>(
            ([key, value]) => {
                return {
                    name: key,
                    value: value,
                };
            }
        );
        option.setChoices(...backgroundColorOptions);

        return option;
    });
    subcommand.addStringOption((option) => {
        option.setName('hex_code');
        option.setDescription("A six digit RGB hex code of the image's background color.");
        option.setMinLength(6);
        option.setMaxLength(6);
        return option;
    });

    return subcommand;
};

export const upscale = (subcommand: SlashCommandSubcommandBuilder) => {
    subcommand.setName('upscale');
    subcommand.setDescription('Upscale an image by 4x.');

    baseImageSubcommand(subcommand);
    return subcommand;
};
