interface ChunkArrayOptions<Element>
{
    array: Element[];
    shouldMoveToNextChunk: (item: Element, index: number, currentChunk: Element[]) => boolean;
}

export const chunkArray = <Element>({ array, shouldMoveToNextChunk }: ChunkArrayOptions<Element>): Element[][] =>
{
    const output = array.reduce<Element[][]>((acc, cur, index) =>
    {
        const currentChunk = acc[acc.length - 1] ?? [];

        // Create a new chunk
        if (shouldMoveToNextChunk(cur, index, currentChunk) || acc.length === 0)
        {
            acc.push([cur]);
        }

        // Add to the current chunk
        else
        {
            currentChunk.push(cur);
        }

        return acc;
    }, []);

    return output;
};
