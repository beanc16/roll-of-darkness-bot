import Singleton from './Singleton.js';

// TODO: Make all of these strings enums later, probably
export interface FlavorTextCategory
{
    key: string;
    type: string;
    category: string;
}

class CategoriesSingleton
{
    private _singleton: Singleton<Record<string, FlavorTextCategory>>;

    constructor(categoriesEnum = {})
    {
        this._singleton = new Singleton(categoriesEnum);
    }

    isInitialized()
    {
        return (Object.keys(this.getAll())?.length > 0);
    }

    getAll()
    {
        /*
         * Payload as of v1.8.1 of @beanc16/microservices-abstraction:
         *  {
         *      "VALUE_THAT_MAPS_TO_KEY": {
         *          "key": string,
         *          "category": string,
         *          "type": string
         *      }
         *  }
         */
        return this._singleton.get() || {};
    }

    getAllAsStringOptionChoices({
        type,
        notType,
    }: { type?: string; notType?: string; } = {})
    {
        const unparsedCategoriesArray = Object.values(this.getAll()) || [];
        const parsedCategoriesArray = unparsedCategoriesArray.reduce(function (acc, category)
        {
            if (
                // Don't include categories that aren't type
                (type && category.type !== type)
                // Don't include categories that are notType
                || (notType && category.type === notType)
            )
            {
                return acc;
            }
            acc.push({
                name: category.category,
                value: category.key.toLowerCase(),
            });

            return acc;
        }, [] as {
            name: string;
            value: string;
        }[]);

        return parsedCategoriesArray;
    }

    get(key: string)
    {
        return this.getAll()[key]?.category;
    }

    set(categoriesEnum = {})
    {
        this._singleton.set(categoriesEnum);
    }
}



export default new CategoriesSingleton();
