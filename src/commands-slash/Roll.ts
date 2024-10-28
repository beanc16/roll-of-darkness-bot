import BaseRollCommand from './base-commands/BaseRollCommand.js';
import { numberOfDice } from './options/shared.js';

class Roll extends BaseRollCommand
{
    constructor()
    {
        super({
            firstParameter: {
                type: 'integer',
                value: numberOfDice,
            },
        });
    }
}



export default new Roll();
