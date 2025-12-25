import { fakemon } from '../Ptu/options/index.js';
import { Ptu } from '../Ptu.js';

class Ptu_Util_Dev extends Ptu
{
    constructor()
    {
        super(false);
        // eslint-disable-next-line no-underscore-dangle -- TODO: Update this in downstream package later
        this._slashCommandData
            .addSubcommandGroup(fakemon);
    }

    // eslint-disable-next-line class-methods-use-this -- Leave as non-static
    get description(): string
    {
        return `Run utility commands for Pokemon Tabletop United.`;
    }
}

export default new Ptu_Util_Dev();
