import Singleton from './Singleton.js';

export class StringSingleton extends Singleton<string>
{
    get length(): number
    {
        return this.get().length;
    }

    public isEmpty(): boolean
    {
        return this.get() === '';
    }
}
