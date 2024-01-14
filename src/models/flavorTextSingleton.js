const { default: Singleton } = require("./Singleton");

class FlavorTextSingleton
{
    constructor(flavorTexts = [])
    {
        this._singleton = new Singleton(flavorTexts);
    }

    get notInitialized()
    {
        return (!this.getAll() || this.getAll()?.length === 0);
    }

    getAll()
    {
        /* Resulting payload:
        [{
            keys: ['General', 'Success'],
            results: ['Flavor Text 1', 'Flavor Text 2'],
        }, {
            // same as above
        }]
        */
        return this._singleton.get();
    }

    get({ keys = [] } = {})
    {
        if (this.notInitialized)
        {
            this.set([]);
        }

        // Get result where all flavor text keys match all of the given keys
        const result = this.getAll().find(function (flavorTextData)
        {
            if (flavorTextData.keys.length !== keys.length)
            {
                return false;
            }

            // All of the given keys match all flavor text data keys
            return flavorTextData.keys.every(function (key)
            {
                return keys.includes(key);
            });
        });

        return result?.results;
    }

    set(flavorTexts = [])
    {
        this._singleton.set(flavorTexts);
    }

    push({ keys = [], results = [] } = {})
    {
        if (this.notInitialized)
        {
            this.set([]);
        }

        this._singleton._value.push({
            keys: keys || [],
            results: results || [],
        })
    }
}



module.exports = new FlavorTextSingleton();
