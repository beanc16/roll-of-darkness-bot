const { RollOfDarknessApi } = require('@beanc16/microservices-abstraction');

class FlavorTextService
{
    constructor()
    {
        this.rollOfDarknessApi = new RollOfDarknessApi();
    }

    async getCategories()
    {
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

        return parsedCategories;
    }
}



module.exports = FlavorTextService;
