const { Text } = require('@beanc16/discordjs-helpers');

class ResponseFormatterService
{
    constructor({
        authorId,
    })
    {
        this.authorId = authorId;
    }

    get authorPing()
    {
        return Text.Ping.user(this.authorId);
    }

    getSuccessesAsSingularOrPlural(numOfSuccesses)
    {
        if (numOfSuccesses === 1)
        {
            return 'success';
        }

        return 'successes';
    }

    getDiceAsSingularOrPlural(numOfDice)
    {
        if (numOfDice === 1)
        {
            return 'die';
        }

        return 'dice';
    }
}



module.exports = ResponseFormatterService;
