const Singleton = require("./Singleton");

class CategoriesSingleton
{
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

    get(key)
    {
        return this.getAll()[key]?.category;
    }

    set(categoriesEnum = {})
    {
        this._singleton.set(categoriesEnum);
    }
}



module.exports = new CategoriesSingleton();
