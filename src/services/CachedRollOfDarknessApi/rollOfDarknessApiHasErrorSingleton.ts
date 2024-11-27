import Singleton from '../Singleton/Singleton.js';

class RollOfDarknessApiHasErrorSingleton extends Singleton<boolean>
{
    constructor()
    {
        super(false);
    }
}

export default new RollOfDarknessApiHasErrorSingleton();
