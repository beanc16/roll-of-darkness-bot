/* eslint-disable max-classes-per-file */

import {
    Channel,
    Message,
    User,
} from 'discord.js';
import { RawUserData } from 'discord.js/typings/rawDataTypes.js';

export class FakeUser extends User
{
    constructor(data: Partial<RawUserData> = {})
    {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument -- Allow for testing purposes
        super({} as any, { ...data } as any);

        Object.entries(data).forEach(([key, value]) =>
        {
            if (value !== undefined)
            {
                // @ts-expect-error -- Allow for testing purposes
                this[key] = value;
            }
        });
    }
}

export const getFakeMessage = <T extends boolean = boolean>(
    content: string = 'fake-content',
    userData: ConstructorParameters<typeof FakeUser>[0] = {},
): Message<T> =>
{
    const user = new FakeUser(userData);
    const output: Message<T> = {
        content,
        author: { bot: false },
        mentions: {
            users: {
                get: jest.fn().mockImplementation((_id: string) => user),
            },
        },
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
