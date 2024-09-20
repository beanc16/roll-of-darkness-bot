import { logger } from '@beanc16/logger';
import Pokedex from '@sherwinski/pokeapi-ts';

type PokeApiId = string | number;

interface GetImageUrlResponse
{
    id: number;
    imageUrl: string;
}

export class PokeApi
{
    private static api = new Pokedex.default();

    public static parseId(id?: PokeApiId): number | undefined
    {
        if (!id)
        {
            return undefined;
        }

        if (typeof id === 'number')
        {
            return id;
        }

        const parsedStringId = id.replace('#', '').trim();
        return parseInt(parsedStringId, 10);
    }

    private static async getById(id?: PokeApiId)
    {
        const parsedId = this.parseId(id);

        if (!parsedId)
        {
            return undefined;
        }

        // Get pokemon from PokeApi
        try {
            return await this.api.pokemon.searchById(parsedId);
        } catch (err) {
            logger.error('Failed to get pokemon from PokeApi', err);
            return undefined;
        }
    }

    private static async getByIds(ids?: PokeApiId[])
    {
        const resultPromises = ids?.map((id) => this.getById(id));

        if (!resultPromises)
        {
            return undefined;
        }

        const results = await Promise.all(resultPromises);

        return results.filter((result) => result !== undefined);
    }

    public static async getImageUrl(id?: PokeApiId): Promise<string | undefined>
    {
        const result = await this.getById(id);

        if (!result)
        {
            return undefined;
        }

        const {
            sprites: {
                other: {
                    'official-artwork': {
                        front_default: imageUrl = null,
                    } = {},
                } = {},
            },
        } = result;

        if (!imageUrl)
        {
            return undefined;
        }

        return imageUrl;
    }

    public static async getImageUrls(ids?: PokeApiId[]): Promise<GetImageUrlResponse[] | undefined>
    {
        const results = await this.getByIds(ids);

        if (!results)
        {
            return undefined;
        }

        return results.reduce<GetImageUrlResponse[]>((acc, {
            id,
            sprites: {
                other: {
                    'official-artwork': {
                        front_default: imageUrl = null,
                    } = {},
                } = {},
            },
        }) => {
            if (imageUrl)
            {
                acc.push({
                    id,
                    imageUrl,
                });
            }

            return acc;
        }, []);
    }
}
