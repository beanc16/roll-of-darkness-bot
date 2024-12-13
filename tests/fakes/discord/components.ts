import { Message } from 'discord.js';

export const getFakeMessage = <T extends boolean = boolean>(content: string = 'fake-content'): Message<T> =>
{
    const output: Message<T> = {
        content,
        author: { bot: false },
        awaitMessageComponent: jest.fn(),
        delete: jest.fn(),
        edit: jest.fn(),
        reply: jest.fn(),
    } as unknown as Message<T>;

    return output;
};
