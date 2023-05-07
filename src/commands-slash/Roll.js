const BaseRollCommand = require('./base-commands/BaseRollCommand');
const options = require('./options');

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



module.exports = new Roll();
