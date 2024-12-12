import { Message } from 'discord.js';

export const getFakeMessage = <T extends boolean = boolean>(content: string = 'fake-content'): Message<T> =>
{
    const output: Message<T> = {
        content,
        reply: jest.fn(),
        author: { bot: false },
    } as unknown as Message<T>;

    return output;
};
