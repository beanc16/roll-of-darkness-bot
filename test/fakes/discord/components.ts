/* eslint-disable max-classes-per-file */

import {
    Channel,
    Message,
    User,
} from 'discord.js';

export const getFakeMessage = <T extends boolean = boolean>(content: string = 'fake-content'): Message<T> =>
{
    const output: Message<T> = {
        content,
        author: { bot: false },
        awaitMessageComponent: jest.fn(),
        delete: jest.fn(),
        edit: jest.fn(),
        fetch: jest.fn().mockImplementation(() => Promise.resolve(output)),
        reply: jest.fn(),
        components: [],
    } as unknown as Message<T>;

    return output;
};

export const getFakeChannel = (): Channel =>
{
    const output: Channel = {
        send: jest.fn().mockImplementation(() => Promise.resolve(getFakeMessage())),
    } as unknown as Channel;

    return output;
};

export class FakeUser extends User
{
    constructor()
    {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument -- Allow for testing purposes
        super({} as any, {} as any);
    }
}
