import { Text } from '@beanc16/discordjs-helpers';

export class ResponseFormatterService
{
    private authorId: string;

    constructor({
        authorId,
    }: { authorId: string; })
    {
        this.authorId = authorId;
    }

    get authorPing()
    {
        return Text.Ping.user(this.authorId);
    }

    getSuccessesAsSingularOrPlural(numOfSuccesses: number)
    {
        if (numOfSuccesses === 1)
        {
            return 'success';
        }

        return 'successes';
    }

    getDiceAsSingularOrPlural(numOfDice: number)
    {
        if (numOfDice === 1)
        {
            return 'die';
        }

        return 'dice';
    }
}
