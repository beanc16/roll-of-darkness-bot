import rollConstants from '../constants/roll.js';
import categoriesSingleton, { FlavorTextCategory } from '../models/categoriesSingleton.js';
import flavorTextSingleton from '../models/flavorTextSingleton.js';
import { CachedRollOfDarknessApi } from './CachedRollOfDarknessApi.js';
import { DiceService } from '../services/DiceService.js';

export default class FlavorTextService
{
    private _categories?: FlavorTextCategory[];

    get categories()
    {
        return this._categories;
    }

    async getCategories({
        refreshCache = false,
    } = {})
    {
        if (!refreshCache && Object.keys(categoriesSingleton.getAll()).length > 0)
        {
            return categoriesSingleton.getAll();
        }

        /*
         * Payload as of v1.8.1 of @beanc16/microservices-abstraction:
         *  {
         *      "categories": [{
         *          "key": string,
         *          "category": string,
         *          "type": string
         *      }, {
         *          // same as above
         *      }]
         *  }
         */
        const {
            categories: unparsedCategories = [],
        } = await CachedRollOfDarknessApi.categories.get();

        if (unparsedCategories.length === 0)
        {
            return [];
        }

        const parsedCategories = unparsedCategories.reduce<Record<string, FlavorTextCategory>>(function (acc, category)
        {
            acc[category.key] = category;
            return acc;
        }, {});

        categoriesSingleton.set(parsedCategories);
        return categoriesSingleton.getAll();
    }

    async getAllFlavorText({
        refreshCache = false,
    }: { refreshCache?: boolean; } = {})
    {
        if (!categoriesSingleton.isInitialized())
        {
            await this.getCategories();
        }

        // Get the cached flavor text if it exists
        const flavorTexts = flavorTextSingleton.getAll();
        if (!refreshCache && flavorTexts?.length > 0)
        {
            return flavorTexts;
        }

        // Get the flavor text from the API
        /*
         * Payload as of v1.8.1 of @beanc16/microservices-abstraction:
         *  {
         *      "flavor_texts": [
         *          "Flavor text 1.",
         *          "Flavor text 2."
         *      ]
         *  }
         */
        const {
            flavor_texts: results = [],
        } = await CachedRollOfDarknessApi.flavorText.get({
            splat: '',
            categories: [],
        });

        if (results?.length > 0)
        {
            return results;
        }

        else
        {
            return [rollConstants.defaultFlavorTextResults];
        }
    }

    async getFlavorText({
        refreshCache = false,
        splat = categoriesSingleton.get('GENERAL'),
        categories = [],
    }: {
        refreshCache?: boolean;
        splat?: string;
        categories?: string[];
    } = {})
    {
        if (!refreshCache && !categoriesSingleton.isInitialized())
        {
            await this.getCategories();
        }

        // Get the cached flavor text if it exists
        const flavorTexts = flavorTextSingleton.get({
            keys: [
                splat,
                ...categories,
            ],
        });
        if (flavorTexts && flavorTexts.length > 0)
        {
            return flavorTexts;
        }

        // Get the flavor text from the API
        /*
         * Payload as of v1.8.1 of @beanc16/microservices-abstraction:
         *  {
         *      "flavor_texts": [
         *          "Flavor text 1.",
         *          "Flavor text 2."
         *      ]
         *  }
         */
        const {
            flavor_texts: results = [],
        } = await CachedRollOfDarknessApi.flavorText.get({
            splat,
            categories,
        });

        if (results?.length > 0)
        {
            flavorTextSingleton.push({
                keys: [
                    splat,
                    ...categories,
                ],
                results,
            });
            return results;
        }

        else
        {
            return [rollConstants.defaultFlavorTextResults];
        }
    }

    async getRandomFlavorText({
        refreshCache = false,
        splat = categoriesSingleton.get('GENERAL'),
        categories = [],
    }: {
        refreshCache?: boolean;
        splat?: string;
        categories?: string[];
    } = {})
    {
        const flavorTexts = await this.getFlavorText({
            refreshCache,
            splat,
            categories,
        });

        const rerollOnGreaterThanOrEqualToNoAgain = rollConstants.rerollsEnum[
            rollConstants.rerollsEnum.no_again.key as keyof typeof rollConstants.rerollsEnum
        ].number;
        const flavorTextRandomizerService = new DiceService({
            count: 1,
            sides: flavorTexts.length,
            rerollOnGreaterThanOrEqualTo: rerollOnGreaterThanOrEqualToNoAgain,
        });

        // Subtract 1 from index since dice won't roll 0 but index starts at 0
        const flavorTextIndex = flavorTextRandomizerService.rollOne()[0].number - 1;
        return flavorTexts[flavorTextIndex];
    }

    async getCategory(category = 'GENERAL')
    {
        if (!categoriesSingleton.isInitialized())
        {
            await this.getCategories();
        }

        return categoriesSingleton.get(category);
    }

    getAllCategoriesAsStringOptionChoices(options = {})
    {
        return categoriesSingleton.getAllAsStringOptionChoices(options);
    }
}
