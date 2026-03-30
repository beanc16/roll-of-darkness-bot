import { Text } from '@beanc16/discordjs-helpers';

import {
    PtuOracleCardAction,
    PtuOracleCardDrawDetailed,
    PtuOracleGameCollection,
    PtuOracleGameStatus,
    PtuOracleGameTime,
    PtuOraclePlayerHandDetailed,
} from '../../../../dal/models/PtuOracleGameCollection.js';
import { OracleEmbedMessage } from './OracleEmbedMessage.js';

interface OracleGameEmbedMessageOptions
{
    showFaceDownCards?: boolean;
}

export class OracleGameEmbedMessage extends OracleEmbedMessage
{
    public static readonly defaultOptions = { showFaceDownCards: false };

    constructor(
        args: PtuOracleGameCollection,
        currentHand: PtuOraclePlayerHandDetailed | undefined,
        options: OracleGameEmbedMessageOptions = OracleGameEmbedMessage.defaultOptions,
    )
    {
        const {
            deckCardNumbers,
            discardCardNumbers,
            dealerDiscordUserId,
        } = args;

        super({
            title: `Oracle Reading - ${args.name}`,
            descriptionLines: OracleGameEmbedMessage.constructDescriptionLines(
                currentHand,
                dealerDiscordUserId,
                options,
            ),
            footer: {
                text: args.status === PtuOracleGameStatus.Complete
                    ? `Status: ${args.status}`
                    : [
                        `Deck: ${deckCardNumbers.length}`,
                        `Discard: ${discardCardNumbers.length}`,
                    ].join(' | '),
            },
        });
    }

    private static constructDescriptionLines(
        currentHand: PtuOraclePlayerHandDetailed | undefined,
        dealerDiscordUserId: string,
        options: OracleGameEmbedMessageOptions,
    ): string[]
    {
        const dealerAndCurrentTurn = [
            `Dealer: ${Text.Ping.user(dealerDiscordUserId)}`,
            ...(currentHand
                ? [`Current Turn: ${Text.Ping.user(currentHand.playerDiscordUserId)}`]
                : []
            ),
        ];

        if (!currentHand)
        {
            return [...dealerAndCurrentTurn, 'Draw cards'];
        }

        const pastCards = this.constructCardsText(currentHand[PtuOracleGameTime.Past], currentHand.isCompleted, options);
        const presentCards = this.constructCardsText(currentHand[PtuOracleGameTime.Present], currentHand.isCompleted, options);
        const futureCards = this.constructCardsText(currentHand[PtuOracleGameTime.Future], currentHand.isCompleted, options);

        const hasCards = pastCards.length > 0 || presentCards.length > 0 || futureCards.length > 0;

        return [
            ...dealerAndCurrentTurn,
            ...(hasCards
                ? [
                    '',
                    Text.underline('Past'),
                    ...pastCards,
                    '',
                    Text.underline('Present'),
                    ...presentCards,
                    '',
                    Text.underline('Future'),
                    ...futureCards,
                ]
                : ['Draw cards']),
        ];
    }

    private static constructCardsText(
        cardDraws: PtuOracleCardDrawDetailed[],
        isCompleted: boolean,
        options: OracleGameEmbedMessageOptions,
    ): string[]
    {
        return cardDraws.map(({
            action,
            card,
            face,
            playerQuestion,
            prophecy,
        }, index, array) =>
        {
            if (action === PtuOracleCardAction.FaceDown && !options.showFaceDownCards)
            {
                return PtuOracleCardAction.FaceDown;
            }

            const emoji = this.getEmojiFromAction(action as PtuOracleCardAction);

            return [
                `${emoji}${card.name} - ${card.descriptor} (${card.category})`,
                ...(options.showFaceDownCards && (
                    action === PtuOracleCardAction.FaceDown
                    || action === PtuOracleCardAction.FaceUp
                )
                    ? [`Status: ${action.toString()}`]
                    : []
                ),
                `Face: ${face}`,
                ...((isCompleted && action !== PtuOracleCardAction.Denied) || (options.showFaceDownCards)
                    ? [`Prophecy: ${prophecy}`]
                    : []
                ),
                ...(
                    (
                        (action === PtuOracleCardAction.Questioned && playerQuestion)
                        || (playerQuestion && options.showFaceDownCards)
                    )
                        ? [`Question: ${playerQuestion}`]
                        : []
                ),
                ...(array.length > 1 && index !== array.length - 1
                    ? ['']
                    : []
                ),
            ].join('\n');
        });
    }

    private static getEmojiFromAction(action: PtuOracleCardAction): string
    {
        switch (action)
        {
            case PtuOracleCardAction.FaceDown:
            case PtuOracleCardAction.FaceUp:
                return '';
            case PtuOracleCardAction.Accepted:
                return '✅ ';
            case PtuOracleCardAction.Denied:
                return '❌ ';
            case PtuOracleCardAction.Questioned:
                return '❓ ';
            default:
                const typeCheck: never = action;
                throw new Error(`Unknown action: ${typeCheck}`);
        }
    }
}
