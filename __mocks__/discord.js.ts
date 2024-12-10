import type Discord from 'discord.js';

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

/*
 * Types
 */

export enum TextInputStyle
{
    Short = 1,
    Paragraph = 2,
};
