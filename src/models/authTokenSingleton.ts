import Singleton from '../services/Singleton.js';

class AuthTokenSingleton
{
    #singleton: Singleton<string>;

    constructor()
    {
        this.#singleton = new Singleton('');
    }

    isEmpty(): boolean
    {
        return this.get() === '';
    }

    get(): string
    {
        return this.#singleton.get();
    }

    set(authToken: string): void
    {
        this.#singleton.set(authToken);
    }
}

export default new AuthTokenSingleton();
