import { FileStorageResourceType, FileStorageService } from '@beanc16/file-storage';
import { logger } from '@beanc16/logger';

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

    public static async getPokemonUrl(speciesName: string): Promise<string>
    {
        const file = await FileStorageService.get({
            appId: process.env.APP_ID as string,
            fileName: speciesName,
            nestedFolders: this.pokemonNestedFolders,
            resourceType: FileStorageResourceType.Image,
        });

        if (!file)
        {
            throw new Error('Pokemon image not found');
        }

        return file.url;
    }

    public static async getFakemonUrl(speciesName: string): Promise<string>
    {
        const file = await FileStorageService.get({
            appId: process.env.APP_ID as string,
            fileName: speciesName,
            nestedFolders: this.fakemonNestedFolders,
            resourceType: FileStorageResourceType.Image,
        });

        if (!file)
        {
            throw new Error('Fakemon image not found');
        }

        return file.url;
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
                await FileStorageService.delete({
                    appId: process.env.APP_ID as string,
                    fileName: speciesName,
                    nestedFolders: this.fakemonNestedFolders,
                    resourceType: FileStorageResourceType.Image,
                });
            }
            catch (error)
            {
                logger.warn('Failed to delete fakemon image', error);
            }
        }

        try
        {
            const { url: newUrl } = await FileStorageService.upload({
                appId: process.env.APP_ID as string,
                file: {
                    fileName: speciesName,
                    url: imageUrl,
                },
                nestedFolders: this.fakemonNestedFolders,
                resourceType: FileStorageResourceType.Image,
            });

            return newUrl;
        }
        catch (error)
        {
            logger.error(error);
            return undefined;
        }
    }

    /* istanbul ignore next */
    public static async transferFakemonImageToPokemon(speciesName: string): Promise<string>
    {
        const response = await FileStorageService.rename({
            appId: process.env.APP_ID as string,
            old: {
                fileName: speciesName,
                nestedFolders: this.fakemonNestedFolders,
            },
            new: {
                fileName: speciesName,
                nestedFolders: this.pokemonNestedFolders,
            },
            resourceType: FileStorageResourceType.Image,
        });

        if (!response)
        {
            throw new Error('Failed to transfer fakemon image to pokemon');
        }

        return response.url;
    }

    /* istanbul ignore next */
    public static async initialize(): Promise<void>
    {
        try
        {
            const file = await FileStorageService.get({
                appId: process.env.APP_ID as string,
                fileName: 'Unknown',
                nestedFolders: 'ptu-pokedex/eden-dex',
                resourceType: FileStorageResourceType.Image,
            });

            if (!file)
            {
                throw new Error('File not found');
            }

            this.unknownImageUrl = file.url;
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
