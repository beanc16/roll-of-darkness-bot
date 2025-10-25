/* eslint-disable max-classes-per-file */

import {
    ButtonInteraction,
    ChatInputCommandInteraction,
    ComponentType,
    StringSelectMenuInteraction,
} from 'discord.js';

import {
    FakeUser,
    getFakeChannel,
    getFakeMessage,
} from './components.js';

export const getFakeButtonInteraction = (
    customId: string = 'fake-id',
    options: Pick<ButtonInteraction, 'replied'> = {
        replied: false,
    },
    messageOptions: {
        content?: string;
    } = {},
    userOptions: {
        id?: string;
    } = {},
): ButtonInteraction =>
{
    const output: ButtonInteraction = {
        customId,
        ...options,
        componentType: ComponentType.Button,
        message: getFakeMessage(messageOptions?.content, userOptions),
        channel: getFakeChannel(),
        user: new FakeUser(userOptions),
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
        this.user = new FakeUser();
    }
}

export class FakeStringSelectMenuInteraction extends StringSelectMenuInteraction
{
    constructor()
    {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument -- Allow for testing purposes
        super({} as any, {} as any);
        this.user = new FakeUser();
    }
}
