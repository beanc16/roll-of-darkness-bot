export default class Singleton<T = unknown>
{
    // TODO: Change this to #value later when all singletons are in TypeScript.
    _value: T;

    constructor(value: T)
    {
        this._value = value;
    }

    get()
    {
        return this._value;
    }

    set(value: T)
    {
        this._value = value;
    }
}
