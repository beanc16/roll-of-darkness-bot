import { logger } from '@beanc16/logger';
import { FileStorageMicroservice } from '@beanc16/microservices-abstraction';

interface HomebrewGetImageUrlResponse
{
    name: string;
    imageUrl: string;
}

export class HomebrewPokeApi
{
    private static unknownImageUrl: string | undefined = undefined;

    /* istanbul ignore next */
    public static async initialize(): Promise<void>
    {
        try
        {
            const { data } = await FileStorageMicroservice.v1.get({
                appId: process.env.APP_ID as string,
                fileName: 'Unknown',
                nestedFolders: 'ptu-pokedex/eden-dex',
            });

            this.unknownImageUrl = data.url;
        }
        catch (error)
        {
            logger.error('Failed to get unknown image url in HomebrewPokeApi', error);
        }
    }

    public static async getImageUrls(names?: string[]): Promise<HomebrewGetImageUrlResponse[] | undefined>
    {
        if (names === undefined || names.length === 0)
        {
            return undefined;
        }

        const promises = names.map(name => FileStorageMicroservice.v1.get({
            appId: process.env.APP_ID as string,
            fileName: name,
            nestedFolders: 'ptu-pokedex/eden-dex',
        }));

        const results = await Promise.allSettled(promises);

        const output = results.reduce<HomebrewGetImageUrlResponse[]>((acc, cur, index) =>
        {
            // Image could not be found, therefore use unknown image url
            if (cur.status === 'rejected' && this.unknownImageUrl !== undefined)
            {
                acc.push({ name: names[index], imageUrl: this.unknownImageUrl });
                return acc;
            }

            // Image could be found
            if (cur.status === 'fulfilled' && cur.value.data)
            {
                const {
                    value: {
                        data: { url },
                    },
                } = cur;
                const urlWithoutSpecialCharacters = url.replaceAll(/%20/g, ' ').replaceAll(/%28/g, '(').replaceAll(/%29/g, ')');
                const pokemonName = names.find(name => urlWithoutSpecialCharacters.toLowerCase().includes(name.toLowerCase()));

                if (pokemonName)
                {
                    acc.push({ name: pokemonName, imageUrl: url });
                }
            }
            return acc;
        }, []);

        return output;
    }
}
