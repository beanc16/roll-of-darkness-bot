const BaseRollCommand = require('./base-commands/BaseRollCommand');
const options = require('./options');

class Roll extends BaseRollCommand
{
    constructor()
    {
        super({
            firstParameter: options.roll.numberOfDice,
        });
    }
}



module.exports = new Roll();
