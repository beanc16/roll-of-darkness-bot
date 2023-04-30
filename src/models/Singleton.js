class Singleton
{
    constructor(value)
    {
        this._value = value;
    }

    get()
    {
        return this._value;
    }

    set(value)
    {
        this._value = value;
    }
}



module.exports = Singleton;
