const { Text } = require('@beanc16/discordjs-helpers');
const ResponseFormatterService = require('./ResponseFormatterService');

class InitiativeResponseFormatterService extends ResponseFormatterService
{
    constructor({
        authorId,
        dicePoolGroup,
        initiativeModifier,
    })
    {
        super({
            authorId,
        });
        this._dicePoolGroup = dicePoolGroup;
        this.rollResult = dicePoolGroup.getBiggestResult().rolls[0][0].number;
        this.initiativeModifier = initiativeModifier;
        this.initiative = this.rollResult + this.initiativeModifier;
    }

    getResponse()
    {
        const optionalPlusSign = (this.initiativeModifier > 0) ? '+' : '';

        const initialInfo = `${this.authorPing} rolled a ${this.rollResult} with a ${optionalPlusSign}${this.initiativeModifier} initiative modifier.`;
        return `${initialInfo}\n\n${Text.bold(`Initiative of ${this.initiative}`)}`;
    }
}



module.exports = InitiativeResponseFormatterService;
