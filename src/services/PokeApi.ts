import { logger } from '@beanc16/logger';
import Pokedex from 'pokedex-promise-v2';

type PokeApiId = string | number;

interface GetImageUrlResponse
{
    id: number;
    name: string;
    imageUrl: string;
}

export class PokeApi
{
    private static api = new Pokedex();

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
            // Replace characters in some names with nothing
            .replaceAll(':', '')
            .replaceAll('.', '')
            .replaceAll(`'`, '')
            .replaceAll('é', 'e')
            // Replace variant names
            .replaceAll('galarian', 'galar')
            .replaceAll('hisuian', 'hisui')
            .replaceAll('alolan', 'alola')
            // Fix specific pokemon
            .replaceAll('aegislash', 'aegislash-blade')
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
            .replaceAll('mimikyu', 'mimikyu-disguised')
            .replaceAll('minior-core', 'minior-red')
            .replaceAll('minior-meteor', 'minior-red-meteor')
            .replaceAll('morpeko', 'morpeko-full-belly')
            .replaceAll('necrozma-dawn-wings', 'necrozma-dawn')
            .replaceAll('necrozma-dusk-mane', 'necrozma-dusk')
            .replaceAll('nidoran-female', 'nidoran-f')
            .replaceAll('nidoran-male', 'nidoran-m')
            .replaceAll('oricorio', 'oricorio-baile')
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

    public static parseNames(names?: string[]): string[]
    {
        const parsedNames = names?.reduce<string[]>((acc, name) => {
            const parsedName = this.parseName(name);

            if (parsedName)
            {
                acc.push(parsedName);
            }
            else
            {
                logger.warn('Failed to parse name:', name);
            }

            return acc;
        }, []);

        return (parsedNames)
            ? parsedNames
            : [];
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
            return await this.api.getPokemonByName(parsedName);
        } catch (err) {
            logger.error('Failed to get Pokémon by name from PokeApi', {
                name,
                parsedName,
            }, err);
            return undefined;
        }
    }

    private static async getByNames(names?: string[])
    {
        const parsedNames = this.parseNames(names);

        // Get pokemon from PokeApi
        try {
            return await this.api.getPokemonByName(parsedNames);
        } catch (err) {
            logger.error('Failed to get Pokémon by name from PokeApi', {
                names,
                parsedNames,
            }, err);
            return undefined;
        }
    }

    public static async getImageUrl(name?: string): Promise<string | undefined>
    {
        const result = await this.getByName(name);

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

    public static async getImageUrls(names?: string[]): Promise<GetImageUrlResponse[] | undefined>
    {
        const results = await this.getByNames(names);

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
