import { ChatInputCommandInteraction } from 'discord.js';

export class FakeChatInputCommandInteraction extends ChatInputCommandInteraction
{
    constructor()
    {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument -- Allow for testing purposes
        super({} as any, {} as any);
    }
}
