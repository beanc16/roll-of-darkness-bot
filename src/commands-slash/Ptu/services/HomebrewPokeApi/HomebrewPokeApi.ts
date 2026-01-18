import { logger } from '@beanc16/logger';
import { FileStorageMicroservice, FileStorageMicroserviceResourceType } from '@beanc16/microservices-abstraction';

interface HomebrewGetImageUrlResponse
{
    name: string;
    imageUrl: string;
}

export class HomebrewPokeApi
{
    private static unknownImageUrl: string | undefined = undefined;
    private static pokemonNestedFolders = 'ptu-pokedex/eden-dex';
    private static fakemonNestedFolders = 'fakemon-commands';

    /* istanbul ignore next */
    static get unknownPokemonUrl(): string | undefined
    {
        return this.unknownImageUrl;
    }

    /* istanbul ignore next */
    private static async getPokemonUrl(speciesName: string): Promise<string>
    {
        const { data } = await FileStorageMicroservice.v1.get({
            appId: process.env.APP_ID as string,
            fileName: speciesName,
            nestedFolders: this.pokemonNestedFolders,
        });

        return data.url;
    }

    /* istanbul ignore next */
    public static async getFakemonUrl(speciesName: string): Promise<string>
    {
        const { data } = await FileStorageMicroservice.v1.get({
            appId: process.env.APP_ID as string,
            fileName: speciesName,
            nestedFolders: this.fakemonNestedFolders,
        });

        return data.url;
    }

    public static async uploadFakemonImage({
        speciesName,
        imageUrl,
        isCreate,
    }: {
        speciesName: string;
        imageUrl: string;
        isCreate: boolean;
    }): Promise<string | undefined>
    {
        // If we're editing the image, try to rename the old one
        // first, which may fail if it doesn't exist yet
        if (!isCreate)
        {
            try
            {
                await FileStorageMicroservice.v1.delete({
                    app: {
                        id: process.env.APP_ID as string,
                    },
                    fileName: speciesName,
                    nestedFolders: this.fakemonNestedFolders,
                    resourceType: FileStorageMicroserviceResourceType.Image,
                });
            }
            catch (error)
            {
                logger.warn('Failed to delete fakemon image', error);
            }
        }

        try {
            const {
                data: {
                    url: newUrl,
                },
            } = await FileStorageMicroservice.v1.upload({
                app: {
                    id: process.env.APP_ID as string,
                },
                file: {
                    fileName: speciesName,
                    url: imageUrl,
                },
                nestedFolders: this.fakemonNestedFolders,
                resourceType: FileStorageMicroserviceResourceType.Image,
            });

            return newUrl;
        } catch (error) {
            logger.error(error);
            return undefined;
        }
    }

    /* istanbul ignore next */
    public static async transferFakemonImageToPokemon(speciesName: string): Promise<string>
    {
        const {
            data: {
                url: newUrl,
            },
        } = await FileStorageMicroservice.v1.rename({
            app: {
                id: process.env.APP_ID as string,
            },
            old: {
                fileName: speciesName,
                nestedFolders: this.fakemonNestedFolders,
            },
            new: {
                fileName: speciesName,
                nestedFolders: this.pokemonNestedFolders,
            },
            resourceType: FileStorageMicroserviceResourceType.Image,
        });

        return newUrl;
    }

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

    public static async getPokemonImageUrls(names?: string[]): Promise<HomebrewGetImageUrlResponse[] | undefined>
    {
        if (names === undefined || names.length === 0)
        {
            return undefined;
        }

        const promises = names.map(name => this.getPokemonUrl(name));

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
            if (cur.status === 'fulfilled' && cur.value)
            {
                const { value: url } = cur;
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
