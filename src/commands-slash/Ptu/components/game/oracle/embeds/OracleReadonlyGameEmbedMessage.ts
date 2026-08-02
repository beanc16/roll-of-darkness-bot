import { OracleGameEmbedMessage } from './OracleGameEmbedMessage.js';

export class OracleReadonlyGameEmbedMessage extends OracleGameEmbedMessage
{
    public static readonly defaultOptions = { showFaceDownCards: false };

    constructor(params: ConstructorParameters<typeof OracleGameEmbedMessage>, turn: number)
    {
        super(...params);

        const [game] = params;

        this.setFooter({
            text: [
                `Status: ${game.status}`,
                `Turn: ${turn}/${game.hands.length}`,
            ].join(' | '),
        });
    }
}
