import {
    ActionRowBuilder,
    APISelectMenuOption,
    StringSelectMenuBuilder,
} from 'discord.js';

import { PtuOracleCardCollection, PtuOracleCardProphecyFace } from '../../../../dal/models/PtuOracleCardCollection.js';
import { PtuOracleGameTime } from '../../../../dal/models/PtuOracleGameCollection.js';
import { constructOracleGameCustomId } from '../utils/oracleCustomIdUtils.js';
import { OracleStringSelectCustomId } from './types.js';

// Used to select card number to replace with
export class OracleSecretDealerReplaceCardP2StringSelectActionRowBuilder extends ActionRowBuilder<StringSelectMenuBuilder>
{
    constructor(
        oracleGameId: string,
        time: PtuOracleGameTime,
        cards: PtuOracleCardCollection[],
        customIdKey: OracleStringSelectCustomId.SelectReplacementCard1
            | OracleStringSelectCustomId.SelectReplacementCard2
            | OracleStringSelectCustomId.SelectReplacementCard3
            | OracleStringSelectCustomId.SelectReplacementCard4
            | OracleStringSelectCustomId.SelectReplacementCard5,
        normalProphecyCardNumbersAddedToDropdown: Set<number>,
    )
    {
        const options = OracleSecretDealerReplaceCardP2StringSelectActionRowBuilder.getOptions(cards, normalProphecyCardNumbersAddedToDropdown);

        super({
            components: [
                new StringSelectMenuBuilder({
                    customId: constructOracleGameCustomId(oracleGameId, customIdKey, time),
                    placeholder: customIdKey,
                    disabled: options.length === 0,
                    options: options.length === 0
                        ? [{ label: 'No options available', value: 'None' }]
                        : options,
                }),
            ],
        });
    }

    private static getOptions(
        cards: PtuOracleCardCollection[],
        normalProphecyCardNumbersAddedToDropdown: Set<number>,
    ): APISelectMenuOption[]
    {
        return cards.map<APISelectMenuOption>(card =>
        {
            const face = normalProphecyCardNumbersAddedToDropdown.has(card.cardNumber)
                ? PtuOracleCardProphecyFace.Reverse
                : PtuOracleCardProphecyFace.Normal;
            const label = `${card.name} - ${card.descriptor} (${card.category}) [${face}]`;
            const truncatedLabel = label.length > 100
                ? `${label.slice(0, 97)}...`
                : label;

            const prophecy = normalProphecyCardNumbersAddedToDropdown.has(card.cardNumber)
                ? card.defaultReverseProphecy
                : card.defaultProphecy;
            const truncatedProphecy = prophecy.length > 100
                ? `${prophecy.slice(0, 97)}...`
                : prophecy;

            normalProphecyCardNumbersAddedToDropdown.add(card.cardNumber);

            return {
                label: truncatedLabel,
                value: `${card.cardNumber.toString()}:${face}`,
                description: truncatedProphecy,
            };
        });
    }
}
