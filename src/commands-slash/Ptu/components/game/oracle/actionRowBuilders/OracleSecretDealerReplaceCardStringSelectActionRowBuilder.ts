import { ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';

import {
    PtuOracleCardAction,
    PtuOracleGameTime,
    PtuOraclePlayerHandDetailed,
} from '../../../../dal/models/PtuOracleGameCollection.js';
import { constructOracleGameCustomId } from '../utils/oracleCustomIdUtils.js';
import { OracleStringSelectCustomId } from './types.js';

// Used to select past / present / future card to replace
export class OracleSecretDealerReplaceCardStringSelectActionRowBuilder extends ActionRowBuilder<StringSelectMenuBuilder>
{
    constructor(oracleGameId: string, currentHand: PtuOraclePlayerHandDetailed | undefined)
    {
        const options = OracleSecretDealerReplaceCardStringSelectActionRowBuilder.getOptions(currentHand);

        super({
            components: [
                new StringSelectMenuBuilder({
                    customId: constructOracleGameCustomId(oracleGameId, OracleStringSelectCustomId.SecretlyReplaceCard),
                    placeholder: OracleStringSelectCustomId.SecretlyReplaceCard,
                    disabled: options.length === 0,
                    options: options.length === 0
                        ? [{ label: 'No options available', value: 'None' }]
                        : options.map(option => ({ label: option, value: option })),
                }),
            ],
        });
    }

    private static getOptions(currentHand: PtuOraclePlayerHandDetailed | undefined): string[]
    {
        if (!currentHand)
        {
            return [];
        }

        const options: string[] = [];

        const hasFaceDownPastCard = currentHand[PtuOracleGameTime.Past].some(card =>
            card.action === PtuOracleCardAction.FaceDown,
        );
        const hasFaceDownPresentCard = currentHand[PtuOracleGameTime.Present].some(card =>
            card.action === PtuOracleCardAction.FaceDown,
        );
        const hasFaceDownFutureCard = currentHand[PtuOracleGameTime.Future].some(card =>
            card.action === PtuOracleCardAction.FaceDown,
        );

        if (hasFaceDownPastCard)
        {
            options.push(PtuOracleGameTime.Past);
        }
        if (hasFaceDownPresentCard)
        {
            options.push(PtuOracleGameTime.Present);
        }
        if (hasFaceDownFutureCard)
        {
            options.push(PtuOracleGameTime.Future);
        }

        return options;
    }
}
