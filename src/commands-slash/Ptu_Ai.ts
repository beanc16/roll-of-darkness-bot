import { generate } from './Ptu/options/index.js';
import { Ptu } from './Ptu.js';

class Ptu_Ai extends Ptu
{
    constructor()
    {
        super(false);
        // eslint-disable-next-line no-underscore-dangle -- TODO: Update this in downstream package later
        this._slashCommandData
            .addSubcommandGroup(generate);
    }

    // eslint-disable-next-line class-methods-use-this -- Leave as non-static
    get description(): string
    {
        return `Run commands that use AI to generate content for Pokemon Tabletop United.`;
    }
}

export default new Ptu_Ai();
