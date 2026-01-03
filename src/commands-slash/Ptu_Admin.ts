import { Ptu } from './Ptu.js';
import { fakemon } from './Ptu/options/index.js';

class Ptu_Admin extends Ptu
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
        return `Run commands that involve admin permissions for Pokemon Tabletop United.`;
    }
}

export default new Ptu_Admin();
