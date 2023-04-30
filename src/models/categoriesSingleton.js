const Singleton = require("./Singleton");

class CategoriesSingleton
{
    constructor(categories = [])
    {
        this._singleton = new Singleton(categories);
    }

    get()
    {
        return this._singleton.get();
    }

    set(categories = [])
    {
        this._singleton.set(categories);
    }
}



module.exports = new CategoriesSingleton();
