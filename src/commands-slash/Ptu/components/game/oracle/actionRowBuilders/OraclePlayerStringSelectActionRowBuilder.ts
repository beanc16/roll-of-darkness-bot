import { ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';

import {
    PtuOracleCardAction,
    PtuOracleGameTime,
    PtuOraclePlayerHandDetailed,
} from '../../../../dal/models/PtuOracleGameCollection.js';
import { constructOracleGameCustomId } from '../utils/oracleCustomIdUtils.js';
import { OracleStringSelectCustomId } from './types.js';

export enum OraclePlayerStringSelectElementOption
{
    PlayNextRound = 'Play Next Round',
    AcceptFate = 'Accept Fate',
    DenyFate = 'Deny Fate',
    QuestionFate = 'Question Fate',
}

export class OraclePlayerStringSelectActionRowBuilder extends ActionRowBuilder<StringSelectMenuBuilder>
{
    constructor(oracleGameId: string, currentHand: PtuOraclePlayerHandDetailed | undefined)
    {
        const options = OraclePlayerStringSelectActionRowBuilder.getOptions(currentHand);

        super({
            components: [
                new StringSelectMenuBuilder({
                    customId: constructOracleGameCustomId(oracleGameId, OracleStringSelectCustomId.PlayerAction),
                    placeholder: OracleStringSelectCustomId.PlayerAction,
                    disabled: options.length === 0,
                    options: options.length === 0
                        ? [{ label: 'No options available', value: 'None' }]
                        : options.map(option => ({ label: option, value: option })),
                }),
            ],
        });
    }

    private static getOptions(currentHand: PtuOraclePlayerHandDetailed | undefined): OraclePlayerStringSelectElementOption[]
    {
        // When there's no current hand or a hand is complete,
        // a player must say they're playing next round
        if (!currentHand || currentHand.isCompleted)
        {
            return [OraclePlayerStringSelectElementOption.PlayNextRound];
        }

        const {
            [PtuOracleGameTime.Past]: past,
            [PtuOracleGameTime.Present]: present,
            [PtuOracleGameTime.Future]: future,
        } = currentHand;

        let hasFaceUpCard = false;
        let hasRejected = false;
        let hasQuestioned = false;

        const allCards = [...past, ...present, ...future];
        for (let index = 0; index < allCards.length; index += 1)
        {
            const { action } = allCards[index];

            if (action === PtuOracleCardAction.FaceUp)
            {
                hasFaceUpCard = true;
                continue;
            }

            if (action === PtuOracleCardAction.Denied)
            {
                hasRejected = true;
                continue;
            }

            if (action === PtuOracleCardAction.Questioned)
            {
                hasQuestioned = true;
                continue;
            }
        }

        // There's a card to accept/reject/question the fate of
        if (hasFaceUpCard)
        {
            return [
                OraclePlayerStringSelectElementOption.AcceptFate,
                ...(hasRejected ? [] : [OraclePlayerStringSelectElementOption.DenyFate]),
                ...(hasQuestioned ? [] : [OraclePlayerStringSelectElementOption.QuestionFate]),
            ];
        }

        // All cards are accepted/rejected/questioned
        return [];
    }
}
