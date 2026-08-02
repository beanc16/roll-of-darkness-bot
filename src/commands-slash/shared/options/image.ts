import { SlashCommandAttachmentOption, SlashCommandStringOption } from 'discord.js';

export const imageOption = (option: SlashCommandAttachmentOption, description?: string): SlashCommandAttachmentOption =>
{
    option.setName('image');
    return option.setDescription(description || 'An image. This will take precedence over image_url.');
};

export const imageUrlOption = (option: SlashCommandStringOption, description?: string): SlashCommandStringOption =>
{
    option.setName('image_url');
    return option.setDescription(description || 'The URL of an image.');
};
