import { LoopableAudioStream } from './LoopableAudioStream.js';

describe('LoopableAudioStream', () =>
{
    const buffer = Buffer.from('I am a machine, a machine I am.');
    let receivedData: string;
    let numOfLoops: number;

    beforeEach(() =>
    {
        receivedData = '';
        numOfLoops = 1;
    });

    describe.each([
        [true, { maxNumOfLoops: 3 }],
        [false, { maxNumOfLoops: undefined }],
    ])('shouldLoop = %s', (shouldLoop, { maxNumOfLoops }) =>
    {
        it('should read data from buffer correctly', async () =>
        {
            await new Promise<void>((resolve) =>
            {
                const stream = new LoopableAudioStream(buffer, shouldLoop);

                stream.on('data', (chunk: string) =>
                {
                    receivedData += chunk.toString();
                    numOfLoops += 1;

                    // Prevent infinite looping after looping the specified number of times (when maxNumOfLoops is specified)
                    if (maxNumOfLoops && numOfLoops === maxNumOfLoops)
                    {
                        stream.push(null);
                    }
                });

                stream.on('end', () =>
                {
                    expect(receivedData).toEqual(
                        buffer.toString().repeat(maxNumOfLoops ?? 1),
                    );
                    resolve();
                });
            });
        });

        it('should handle empty buffer correctly', async () =>
        {
            await new Promise<void>((resolve) =>
            {
                const emptyBuffer = Buffer.alloc(0);
                const stream = new LoopableAudioStream(emptyBuffer, shouldLoop);

                stream.on('data', (chunk: string) =>
                {
                    receivedData += chunk.toString();
                    numOfLoops += 1;

                    // Stop after looping the specified number of times (when maxNumOfLoops is specified)
                    if (maxNumOfLoops !== undefined && numOfLoops === maxNumOfLoops)
                    {
                        stream.push(null);
                    }
                });

                stream.on('end', () =>
                {
                    expect(receivedData).toEqual('');
                    resolve();
                });
            });
        });
    });
});
