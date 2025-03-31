import { FileStorageMicroservice } from '@beanc16/microservices-abstraction';

interface HomebrewGetImageUrlResponse
{
    name: string;
    imageUrl: string;
}

// TODO: Add unit tests

export class HomebrewPokeApi
{
    public static async getImageUrls(names?: string[]): Promise<HomebrewGetImageUrlResponse[] | undefined>
    {
        const promises = names?.map(name => FileStorageMicroservice.v1.get({
            appId: process.env.APP_ID as string,
            fileName: name,
            nestedFolders: 'ptu-pokedex/eden-dex',
        }));

        if (!promises || promises.length === 0)
        {
            return undefined;
        }

        const results = await Promise.all(promises);

        const output = results.reduce<HomebrewGetImageUrlResponse[]>((acc, { data }) =>
        {
            if (data)
            {
                const { url } = data;
                const pokemonName = names?.find(name => url.toLowerCase().includes(name.toLowerCase()));

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
