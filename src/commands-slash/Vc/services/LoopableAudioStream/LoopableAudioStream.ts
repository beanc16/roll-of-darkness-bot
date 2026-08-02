import { Readable } from 'node:stream';

// This class allows us to loop an audio Buffer without
// any extra discord.js event-handling logic.

export class LoopableAudioStream extends Readable
{
    private buffer: Buffer;
    private position: number = 0;
    private shouldLoop: boolean;

    constructor(buffer: Buffer, shouldLoop: boolean)
    {
        super();
        this.buffer = buffer;
        this.shouldLoop = shouldLoop;
    }

    private get isEmpty(): boolean
    {
        return this.position === 0 && this.buffer.length === 0;
    }

    // eslint-disable-next-line no-underscore-dangle -- This is the default implementation
    public _read(size: number): void
    {
        const chunk = Uint8Array.prototype.slice.call(
            this.buffer,
            this.position,
            this.position + size,
        );
        this.push(chunk);

        this.position += chunk.length;

        if (this.position >= this.buffer.length)
        {
            // Restart from the beginning
            if (this.shouldLoop && !this.isEmpty)
            {
                this.position = 0;
            }

            // End the stream
            else
            {
                this.push(null);
            }
        }
    }
}
