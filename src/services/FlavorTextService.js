const { RollOfDarknessApi } = require('@beanc16/microservices-abstraction');
const categoriesSingleton = require('../models/categoriesSingleton');
const flavorTextSingleton = require('../models/flavorTextSingleton');

class FlavorTextService
{
    constructor()
    {
        this.rollOfDarknessApi = new RollOfDarknessApi();
    }

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
        const unparsedCategories = await this.rollOfDarknessApi.categories.get();

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
        const flavorText = flavorTextSingleton.get({
            keys: [
                splat,
                ...categories,
            ],
        });
        if (flavorText?.length > 0)
        {
            return flavorText;
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
        return await this.rollOfDarknessApi.flavorText.get({
            splat,
            categories,
        });
    }
}



module.exports = FlavorTextService;
