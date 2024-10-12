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
    getPagedDownloadUrls: (urls: string[]) => Promise<string[][]>;
}

@staticImplements<MediaDownloader>()
export class InstagramMediaDownloader
{
    /**
     * Get a list of download urls. Each nested array maps to a given url.
     */
    static async getPagedDownloadUrls(urls: string[]): Promise<string[][]>
    {
        const promises = urls.map((url) => instagramGetUrl(url));
        const unparsedResults = await Promise.all(promises);

        const pagedDownloadUrls = unparsedResults.reduce<string[][]>((acc, { url_list }, index) =>
        {
            acc[index] = url_list;
            return acc;
        }, []);

        return pagedDownloadUrls;
    }
}
