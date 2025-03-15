/* eslint-disable max-classes-per-file */

import {
    ButtonInteraction,
    ChatInputCommandInteraction,
    StringSelectMenuInteraction,
} from 'discord.js';

import {
    FakeUser,
    getFakeChannel,
    getFakeMessage,
} from './components.js';

export const getFakeButtonInteraction = (customId: string = 'fake-id'): ButtonInteraction =>
{
    const output: ButtonInteraction = {
        customId,
        message: getFakeMessage(),
        channel: getFakeChannel(),
        user: new FakeUser(),
        deferReply: jest.fn(),
        deferUpdate: jest.fn(),
        deleteReply: jest.fn(),
        editReply: jest.fn(),
        fetchReply: jest.fn(),
        followUp: jest.fn(),
        reply: jest.fn(),
        update: jest.fn(),
        showModal: jest.fn(),
    } as unknown as ButtonInteraction;

    return output;
};

export class FakeChatInputCommandInteraction extends ChatInputCommandInteraction
{
    constructor()
    {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument -- Allow for testing purposes
        super({} as any, {} as any);
    }
}

export class FakeStringSelectMenuInteraction extends StringSelectMenuInteraction
{
    constructor()
    {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument -- Allow for testing purposes
        super({} as any, {} as any);
    }
}
