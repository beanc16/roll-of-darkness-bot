import { Ptu } from './Ptu.js';
import {
    breed,
    game,
    metadata,
    train,
    typeEffectiveness,
} from './Ptu/options/index.js';

class Ptu_Util extends Ptu
{
    constructor()
    {
        super(false);
        // eslint-disable-next-line no-underscore-dangle -- TODO: Update this in downstream package later
        this._slashCommandData
            .addSubcommand(breed)
            .addSubcommandGroup(game)
            .addSubcommand(metadata)
            .addSubcommand(train)
            .addSubcommand(typeEffectiveness);
    }

    // eslint-disable-next-line class-methods-use-this -- Leave as non-static
    get description(): string
    {
        return `Run utility commands for Pokemon Tabletop United.`;
    }
}

export default new Ptu_Util();
