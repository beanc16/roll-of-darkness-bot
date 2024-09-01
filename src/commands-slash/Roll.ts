import BaseRollCommand from './base-commands/BaseRollCommand.js';
import * as options from './options/index.js';

class Roll extends BaseRollCommand
{
    constructor()
    {
        super({
            firstParameter: {
                type: 'integer',
                value: options.roll.numberOfDice,
            },
        });
    }
}



export default new Roll();
