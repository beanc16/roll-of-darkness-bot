import EventEmitter from 'node:events';

import type { EmbedBuilder } from 'discord.js';

export enum GeneratePlaygroundEvent
{
    Response = 'response',
    ResponseError = 'responseError',
}

class GeneratePlaygroundEmitter extends EventEmitter
{
    public emit(event: GeneratePlaygroundEvent.Response, data: { embeds: EmbedBuilder[] }): boolean;
    public emit(event: GeneratePlaygroundEvent.ResponseError, data: undefined): boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Allow for overloading
    public emit(event: GeneratePlaygroundEvent, data: any): boolean
    {
        return super.emit(event, data);
    }

    public on(event: GeneratePlaygroundEvent.Response, listener: (data: { embeds: EmbedBuilder[] }) => void): this;
    public on(event: GeneratePlaygroundEvent.ResponseError, listener: () => void): this;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Allow for overloading
    public on(event: GeneratePlaygroundEvent, listener: (data: any) => void): this
    {
        return super.on(event, listener);
    }
}

export const generatePlaygroundEmitter = new GeneratePlaygroundEmitter();
