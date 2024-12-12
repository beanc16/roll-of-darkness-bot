import Discord from 'discord.js';

/*
 * Builders
 */

export const ActionRowBuilder = jest.fn<Discord.ActionRowBuilder, []>().mockImplementation(() =>
{
    const result: Discord.ActionRowBuilder = {
        components: [],
        data: {},
        addComponents: jest.fn().mockImplementation(() => result),
        setComponents: jest.fn().mockImplementation(() => result),
        toJSON: jest.fn(),
    };

    return result;
});

export const ButtonBuilder = jest.fn<Discord.ButtonBuilder, []>().mockImplementation(() =>
{
    const result: Discord.ButtonBuilder = {
        data: {},
        setCustomId: jest.fn().mockImplementation(() => result),
        setDisabled: jest.fn().mockImplementation(() => result),
        setEmoji: jest.fn().mockImplementation(() => result),
        setLabel: jest.fn().mockImplementation(() => result),
        setStyle: jest.fn().mockImplementation(() => result),
        setURL: jest.fn().mockImplementation(() => result),
        toJSON: jest.fn(),
    };

    return result;
});

export const EmbedBuilder = jest.fn<Discord.EmbedBuilder, []>().mockImplementation(() =>
{
    const result: Discord.EmbedBuilder = {
        data: {},
        addFields: jest.fn().mockImplementation(() => result),
        setAuthor: jest.fn().mockImplementation(() => result),
        setColor: jest.fn().mockImplementation(() => result),
        setDescription: jest.fn().mockImplementation(() => result),
        setFields: jest.fn().mockImplementation(() => result),
        setFooter: jest.fn().mockImplementation(() => result),
        setImage: jest.fn().mockImplementation(() => result),
        setThumbnail: jest.fn().mockImplementation(() => result),
        setTimestamp: jest.fn().mockImplementation(() => result),
        setTitle: jest.fn().mockImplementation(() => result),
        setURL: jest.fn().mockImplementation(() => result),
        spliceFields: jest.fn(),
        toJSON: jest.fn(),
    };

    return result;
});

export const StringSelectMenuBuilder = jest.fn<Discord.StringSelectMenuBuilder, []>().mockImplementation(() =>
{
    const result: Discord.StringSelectMenuBuilder = {
        data: {},
        options: [],
        addOptions: jest.fn().mockImplementation(() => result),
        setCustomId: jest.fn().mockImplementation(() => result),
        setDisabled: jest.fn().mockImplementation(() => result),
        setPlaceholder: jest.fn().mockImplementation(() => result),
        setMinValues: jest.fn().mockImplementation(() => result),
        setMaxValues: jest.fn().mockImplementation(() => result),
        setOptions: jest.fn().mockImplementation(() => result),
        spliceOptions: jest.fn(),
        toJSON: jest.fn(),
    };

    return result;
});

export const StringSelectMenuOptionBuilder = jest.fn<Discord.StringSelectMenuOptionBuilder, []>().mockImplementation(() =>
{
    const result: Discord.StringSelectMenuOptionBuilder = {
        data: {},
        setDefault: jest.fn().mockImplementation(() => result),
        setDescription: jest.fn().mockImplementation(() => result),
        setEmoji: jest.fn().mockImplementation(() => result),
        setLabel: jest.fn().mockImplementation(() => result),
        setValue: jest.fn().mockImplementation(() => result),
        toJSON: jest.fn(),
    };

    return result;
});

/*
 * Clients
 */

export const Client = jest.fn<Discord.Client, []>().mockImplementation(() =>
{
    const result: Discord.Client = {
        login: jest.fn<Promise<string>, [string?]>().mockResolvedValue('Logged in'),
    } as unknown as Discord.Client; // TODO: Remove this typecast once all required properties are added

    return result;
});

export const WebhookClient = jest.fn().mockImplementation(() =>
{
    return {
        editMessage: jest.fn(),
        fetchMessage: jest.fn(),
        send: jest.fn(),
    };
});

/*
 * Components
 */

export const AttachmentPayload = jest.fn().mockImplementation(() =>
{
    return {
        attachment: 'fake-attachment',
        name: 'fake-name',
        description: 'fake-description',
    };
});

export const Message = jest.fn().mockImplementation(() =>
{
    return {
        content: 'fake-content',
        reply: jest.fn(),
        author: { bot: false },
    };
});

/*
 * Interactions
 */

export const ButtonInteraction = jest.fn<Discord.ButtonInteraction, []>().mockImplementation(() =>
{
    const result: Discord.ButtonInteraction = {
        deferReply: jest.fn(),
        deferUpdate: jest.fn(),
        deleteReply: jest.fn(),
        editReply: jest.fn(),
        fetchReply: jest.fn(),
        followUp: jest.fn(),
        reply: jest.fn(),
        update: jest.fn(),
        showModal: jest.fn(),
    } as unknown as Discord.ButtonInteraction; // TODO: Remove this typecast once all required properties are added

    return result;
});

export const ChatInputCommandInteraction = jest.fn<Discord.ChatInputCommandInteraction, []>().mockImplementation(() =>
{
    const result: Discord.ChatInputCommandInteraction = {
        isCommand: jest.fn(() => true),
        commandName: 'fake-command-name',
        options: {
            getSubcommand: jest.fn<string | null, [boolean?]>(),
            getSubcommandGroup: jest.fn<string | null, [boolean?]>(),
            getBoolean: jest.fn<boolean | null, [boolean?]>(),
            getString: jest.fn<string | null, [boolean?]>(),
            getInteger: jest.fn<number | null, [boolean?]>(),
            getNumber: jest.fn<number | null, [boolean?]>(),
        },
        deferReply: jest.fn(),
        deleteReply: jest.fn(),
        editReply: jest.fn(),
        fetchReply: jest.fn(),
        followUp: jest.fn(),
        reply: jest.fn(),
        showModal: jest.fn(),
    } as unknown as Discord.ChatInputCommandInteraction; // TODO: Remove this typecast once all required properties are added

    return result;
});

export const Interaction = jest.fn().mockImplementation(() =>
{
    return {
        isCommand: jest.fn(() => true),
        commandName: '',
        reply: jest.fn(),
    };
});

export const StringSelectMenuInteraction = jest.fn<Discord.StringSelectMenuInteraction, []>().mockImplementation(() =>
{
    const result: Discord.StringSelectMenuInteraction = {
        deferReply: jest.fn(),
        deferUpdate: jest.fn(),
        deleteReply: jest.fn(),
        editReply: jest.fn(),
        fetchReply: jest.fn(),
        followUp: jest.fn(),
        reply: jest.fn(),
        update: jest.fn(),
        showModal: jest.fn(),
    } as unknown as Discord.StringSelectMenuInteraction; // TODO: Remove this typecast once all required properties are added

    return result;
});

/*
 * Types
 */

export enum ButtonStyle
{
    Primary = 1,
    Secondary = 2,
    Success = 3,
    Danger = 4,
    Link = 5,
}

export enum TextInputStyle
{
    Short = 1,
    Paragraph = 2,
};
