const { Text } = require('@beanc16/discordjs-helpers');
const ResponseFormatterService = require('./ResponseFormatterService');

class InitiativeResponseFormatterService extends ResponseFormatterService
{
    constructor({
        authorId,
        dicePoolGroup,
        initiativeModifier,
        name,
    })
    {
        super({
            authorId,
        });
        this._dicePoolGroup = dicePoolGroup;
        this.rollResult = dicePoolGroup.getBiggestResult().rolls[0][0].number;
        this.initiativeModifier = initiativeModifier;
        this.initiative = this.rollResult + this.initiativeModifier;
        this.name = name;
    }

    getResponse()
    {
        const optionalPlusSign = (this.initiativeModifier > 0) ? '+' : '';
        const rollName = (this.name) ? ` for ${this.name}` : '';

        const initialInfo = `${this.authorPing} rolled a ${this.rollResult} with a ${optionalPlusSign}${this.initiativeModifier} initiative modifier${rollName}.`;
        return `${initialInfo}\n\n${Text.bold(`Initiative of ${this.initiative}`)}`;
    }
}



module.exports = InitiativeResponseFormatterService;
