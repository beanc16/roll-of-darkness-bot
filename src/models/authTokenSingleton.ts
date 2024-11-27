import Singleton from '../services/Singleton/Singleton.js';

class AuthTokenSingleton
{
    private singleton: Singleton<string>;

    constructor()
    {
        this.singleton = new Singleton('');
    }

    public isEmpty(): boolean
    {
        return this.get() === '';
    }

    public get(): string
    {
        return this.singleton.get();
    }

    public set(authToken: string): void
    {
        this.singleton.set(authToken);
    }
}

export default new AuthTokenSingleton();
