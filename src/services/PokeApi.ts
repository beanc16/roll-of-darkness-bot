import { logger } from '@beanc16/logger';
import Pokedex from '@sherwinski/pokeapi-ts';

type PokeApiId = string | number;

interface GetImageUrlResponse
{
    id: number;
    name: string;
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

    public static parseName(name?: string): string | undefined
    {
        if (!name)
        {
            return undefined;
        }

        let parsedName = name.toLowerCase()
            // Remove parenthesis
            .replaceAll('(', '')
            .replaceAll(')', '')
            // Replace spaces with hyphens
            .replaceAll(' ', '-')
            // Replace variant names
            .replaceAll('galarian', 'galar')
            .replaceAll('hisuian', 'hisui')
            .replaceAll('alolan', 'alola')
            // Fix specific pokemon
            .replaceAll('basculin', 'basculin-red-striped')
            .replaceAll('calyrex-ice-rider', 'calyrex-ice')
            .replaceAll('calyrex-shadow-rider', 'calyrex-shadow')
            .replaceAll('darmanitan-galar', 'darmanitan-galar-standard')
            .replaceAll('darmanitan-galar-standard-zen', 'darmanitan-galar-zen') // Undo the previous replace all if it's zen mode
            .replaceAll('eiscue-ice-face', 'eiscue-ice')
            .replaceAll('eiscue-noice-face', 'eiscue-noice')
            .replaceAll('hoopa-confined', 'hoopa')
            .replaceAll('keldeo', 'keldeo-ordinary')
            .replaceAll('kyurem-zekrom', 'kyurem-black')
            .replaceAll('kyurem-reshiram', 'kyurem-white')
            .replaceAll('meloetta-step', 'meloetta-pirouette')
            .replaceAll('minior-core', 'minior-red')
            .replaceAll('minior-meteor', 'minior-red-meteor')
            .replaceAll('morpeko', 'morpeko-full-belly')
            .replaceAll('mr.-mime', 'mr-mime')
            .replaceAll('mr.-rime', 'mr-rime')
            .replaceAll('necrozma-dawn-wings', 'necrozma-dawn')
            .replaceAll('necrozma-dusk-mane', 'necrozma-dusk')
            .replaceAll('wishiwashi-schooling', 'wishiwashi-school')
            .replaceAll('zacian-crowned-sword', 'zacian-crowned')
            .replaceAll('zamazenta-crowned-shield', 'zamazenta-crowned')
            .replaceAll('zacian-hero', 'zacian')
            .replaceAll('zamazenta-hero', 'zamazenta');

        if (parsedName === 'darmanitan')
        {
            parsedName += '-standard';
        }
        else if (parsedName === 'wishiwashi')
        {
            parsedName += '-solo';
        }
        else if (parsedName === 'zygarde')
        {
            parsedName += '-50';
        }

        return parsedName;
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
            logger.error('Failed to get pokemon by id from PokeApi', err);
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

    private static async getByName(name?: string)
    {
        const parsedName = this.parseName(name);

        if (!parsedName)
        {
            return undefined;
        }

        // Get pokemon from PokeApi
        try {
            return await this.api.pokemon.searchByName(parsedName);
        } catch (err) {
            logger.error('Failed to get pokemon by name from PokeApi', {
                name,
                parsedName,
            }, err);
            return undefined;
        }
    }

    private static async getByNames(names?: string[])
    {
        const resultPromises = names?.map((name) => this.getByName(name));

        if (!resultPromises)
        {
            return undefined;
        }

        const results = await Promise.all(resultPromises);

        return results.filter((result) => result !== undefined);
    }

    public static async getImageUrl(id?: PokeApiId, name?: string): Promise<string | undefined>
    {
        const result = (name)
            ? await this.getByName(name)
            : await this.getById(id);

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

    public static async getImageUrls(ids?: PokeApiId[], names?: string[]): Promise<GetImageUrlResponse[] | undefined>
    {
        const results = (names)
            ? await this.getByNames(names)
            : await this.getByIds(ids);

        if (!results)
        {
            return undefined;
        }

        return results.reduce<GetImageUrlResponse[]>((acc, {
            id,
            name,
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
                    name,
                    imageUrl,
                });
            }

            return acc;
        }, []);
    }
}
