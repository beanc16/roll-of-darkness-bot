import { Text } from '@beanc16/discordjs-helpers';

export class ResponseFormatterService
{
    private authorId: string;

    constructor({
        authorId,
    }: { authorId: string })
    {
        this.authorId = authorId;
    }

    get authorPing(): string
    {
        return Text.Ping.user(this.authorId);
    }

    // eslint-disable-next-line class-methods-use-this -- We want subclasses to inherit this
    public getSuccessesAsSingularOrPlural(numOfSuccesses: number): 'success' | 'successes'
    {
        if (numOfSuccesses === 1)
        {
            return 'success';
        }

        return 'successes';
    }
}
