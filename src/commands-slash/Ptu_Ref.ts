import { Ptu } from './Ptu.js';
import { lookup, quickReference } from './Ptu/options/index.js';

class Ptu_Ref extends Ptu
{
    constructor()
    {
        super(false);
        // eslint-disable-next-line no-underscore-dangle -- TODO: Update this in downstream package later
        this._slashCommandData
            .addSubcommandGroup((subcommandGroup) => lookup(subcommandGroup, 0))
            .addSubcommandGroup((subcommandGroup) => lookup(subcommandGroup, 1))
            .addSubcommand(quickReference);
    }

    // eslint-disable-next-line class-methods-use-this -- Leave as non-static
    get description(): string
    {
        return `Run commands to reference mechanics for Pokemon Tabletop United.`;
    }
}

export default new Ptu_Ref();
