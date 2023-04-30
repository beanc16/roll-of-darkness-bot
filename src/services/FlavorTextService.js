const { RollOfDarknessApi } = require('@beanc16/microservices-abstraction');
const { defaultFlavorTextResults } = require('../constants/roll');
const categoriesSingleton = require('../models/categoriesSingleton');
const flavorTextSingleton = require('../models/flavorTextSingleton');
const { logger } = require('@beanc16/logger');

class FlavorTextService
{
    get categories()
    {
        return this._categories;
    }

    async getCategories()
    {
        if (categoriesSingleton.get()?.length > 0)
        {
            return categoriesSingleton.get();
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
            data: {
                categories: unparsedCategories = [],
            } = {},
        } = await RollOfDarknessApi.categories.get();

        const parsedCategories = unparsedCategories.reduce(function (acc, category)
        {
            acc[category.key] = category;
            return acc;
        }, {});

        categoriesSingleton.set(parsedCategories);
        return categoriesSingleton.get();
    }

    async getFlavorText({
        splat = categoriesSingleton.get('GENERAL'),
        categories = [],
    } = {})
    {
        if (!categoriesSingleton.isInitialized())
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
        if (flavorTexts?.length > 0)
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
        try
        {
            const {
                data: {
                    flavor_texts: results = [],
                } = {},
            } = await RollOfDarknessApi.flavorText.get({
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
                return defaultFlavorTextResults;
            }
        }
        catch (err)
        {
            logger.error('Error getting flavor text', err);
            return defaultFlavorTextResults;
        }
    }
}



module.exports = FlavorTextService;
