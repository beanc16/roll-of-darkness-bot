import { Text } from '@beanc16/discordjs-helpers';
import { ResponseFormatterService } from './ResponseFormatterService.js';

export default class CoinFlipResponseFormatterService extends ResponseFormatterService
{
    private headsOrTails: string;
    private result: string;
    private name?: string | null;
    private successfullyPredictedResult: boolean;

    constructor({
        authorId = '',
        headsOrTails,
        name,
        result,
    }: {
        authorId?: string;
        headsOrTails: string;
        name?: string | null;
        result: string;
    })
    {
        super({
            authorId,
        });
        this.headsOrTails = headsOrTails;
        this.result = result;
        this.name = name;
        this.successfullyPredictedResult = (result === headsOrTails);
    }

    getRandomFlavorText()
    {
        // TODO: Make the API handle this later
        if (this.successfullyPredictedResult) {
            return 'You must be so proud of successfully predicting the correct answer to a 50% chance.';
        } else {
            return `It's okay, we can't all be right.`;
        }
    }

    getResponse()
    {
        const rollName = (this.name) ? ` for ${this.name}` : '';

        return `${this.authorPing} flipped a coin, predicted that it would be ${Text.bold(this.headsOrTails)}, and got ${Text.bold(this.result)}${rollName}. ${this.getRandomFlavorText()}`;
    }
}
