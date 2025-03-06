import { Readable } from 'node:stream';

// This allows us to loop an audio Buffer without
// any extra discord.js event-handling logic.

export class LoopableAudioStream extends Readable
{
    private buffer: Buffer;
    private position: number = 0;
    private shouldLoop: boolean;

    constructor(buffer: Buffer, shouldLoop = false)
    {
        super();
        this.buffer = buffer;
        this.shouldLoop = shouldLoop;
    }

    // eslint-disable-next-line no-underscore-dangle
    public _read(size: number): void
    {
        const chunk = Uint8Array.prototype.slice.call(this.buffer, this.position, this.position + size);
        this.push(chunk);

        this.position += chunk.length;

        if (this.position >= this.buffer.length)
        {
            if (this.shouldLoop)
            {
                this.position = 0; // Restart from the beginning
            }

            else
            {
                this.push(null); // End the stream
            }
        }
    }
}
