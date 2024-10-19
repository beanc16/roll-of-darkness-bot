// @ts-ignore -- This package doesn't have any types.
import instagramGetUrlUntyped from 'instagram-url-direct';
import { staticImplements } from '../../../decorators/staticImplements.js';

type InstagramGetUrl = (url: string) => Promise<{
    results_number: number;
    url_list: string[];
}>;

const instagramGetUrl: InstagramGetUrl = instagramGetUrlUntyped;

export interface MediaDownloader
{
    getPagedDownloadUrls: (urls: string[]) => Promise<Buffer[][]>;
}

@staticImplements<MediaDownloader>()
export class InstagramMediaDownloader
{
    /**
     * Get a list of download urls. Each nested array maps to a given url.
     */
    static async getPagedDownloadUrls(urls: string[]): Promise<Buffer[][]>
    {
        const promises = urls.map((url) => instagramGetUrl(url));
        const unparsedResults = await Promise.all(promises);

        const pagedDownloadUrls = unparsedResults.reduce<string[][]>((acc, { url_list }, index) =>
        {
            acc[index] = url_list;
            return acc;
        }, []);

        return this.convertUrlsToBuffers(pagedDownloadUrls);
    }

    /**
     * Discord doesn't display certain image types like .heic.
     * By fetching the images and converting them to all to
     * Buffers, we can guarantee that they'll be displayed.
     */
    private static async convertUrlsToBuffers(pagedDownloadUrls: string[][]): Promise<Buffer[][]>
    {
        const promises = pagedDownloadUrls.map(async (pages) =>
        {
            const imageBuffers: Buffer[] = [];

            for (const url of pages)
            {
                // Get image
                const response = await fetch(url);

                // Convert to Buffer
                const arrayBuffer = await response.arrayBuffer();
                const buffer = this.toBuffer(arrayBuffer);

                imageBuffers.push(buffer);
            }

            return imageBuffers;
        });

        return await Promise.all(promises);
    }

    private static toBuffer(arrayBuffer: ArrayBuffer): Buffer
    {
        const buffer = Buffer.alloc(arrayBuffer.byteLength);
        const view = new Uint8Array(arrayBuffer);

        for (let i = 0; i < buffer.length; ++i)
        {
            buffer[i] = view[i];
        }

        return buffer;
    }
}
