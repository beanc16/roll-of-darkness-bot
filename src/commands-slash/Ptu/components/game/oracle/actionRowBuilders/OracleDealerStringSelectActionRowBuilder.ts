import { ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';

import {
    PtuOracleCardAction,
    PtuOracleGameStatus,
    PtuOracleGameTime,
    PtuOraclePlayerHandDetailed,
} from '../../../../dal/models/PtuOracleGameCollection.js';
import { constructOracleGameCustomId } from '../utils/oracleCustomIdUtils.js';
import { OracleStringSelectCustomId } from './types.js';

export enum OracleDealerStringSelectElementOption
{
    Deal3Cards = 'Deal 3 Cards',
    Deal1PastCard = 'Deal 1 Past Card',
    Deal1PresentCard = 'Deal 1 Present Card',
    Deal1FutureCard = 'Deal 1 Future Card',
    PeakAtCards = 'Peak At Cards',
    RevealNextCard = 'Reveal Next Card',
    EditNotes = 'Edit Notes (optional)',
    RevealFullProphecy = 'Reveal Full Prophecy',
    CompleteGame = 'Complete Game',
    ResumeGame = 'Resume Game',
}

export class OracleDealerStringSelectActionRowBuilder extends ActionRowBuilder<StringSelectMenuBuilder>
{
    constructor(
        oracleGameId: string,
        currentHand: PtuOraclePlayerHandDetailed | undefined,
        status: PtuOracleGameStatus,
    )
    {
        const options = OracleDealerStringSelectActionRowBuilder.getOptions(currentHand, status);

        super({
            components: [
                new StringSelectMenuBuilder({
                    customId: constructOracleGameCustomId(oracleGameId, OracleStringSelectCustomId.DealerAction),
                    placeholder: OracleStringSelectCustomId.DealerAction,
                    disabled: options.length === 0,
                    options: options.length === 0
                        ? [{ label: 'No options available', value: 'None' }]
                        : options.map(option => ({ label: option, value: option })),
                }),
            ],
        });
    }

    private static getOptions(
        currentHand: PtuOraclePlayerHandDetailed | undefined,
        status: PtuOracleGameStatus,
    ): OracleDealerStringSelectElementOption[]
    {
        if (!currentHand)
        {
            return [];
        }

        if (status === PtuOracleGameStatus.Complete)
        {
            return [OracleDealerStringSelectElementOption.ResumeGame];
        }

        // Hand is not yet dealt
        if (
            currentHand[PtuOracleGameTime.Past].length === 0
            && currentHand[PtuOracleGameTime.Present].length === 0
            && currentHand[PtuOracleGameTime.Future].length === 0
        )
        {
            return [
                OracleDealerStringSelectElementOption.Deal3Cards,
                OracleDealerStringSelectElementOption.Deal1PastCard,
                OracleDealerStringSelectElementOption.Deal1PresentCard,
                OracleDealerStringSelectElementOption.Deal1FutureCard,
            ];
        }

        if (currentHand.isCompleted)
        {
            return [
                OracleDealerStringSelectElementOption.EditNotes,
                OracleDealerStringSelectElementOption.CompleteGame,
            ];
        }

        const {
            [PtuOracleGameTime.Past]: past,
            [PtuOracleGameTime.Present]: present,
            [PtuOracleGameTime.Future]: future,
        } = currentHand;

        let hasFaceDownCard = false;

        const allCards = [...past, ...present, ...future];
        for (let index = 0; index < allCards.length; index += 1)
        {
            const { action } = allCards[index];

            if (action === PtuOracleCardAction.FaceDown)
            {
                hasFaceDownCard = true;
                continue;
            }

            // Player must select whether to accept/reject/question the current card
            // before any other dealer actions can be taken
            if (action === PtuOracleCardAction.FaceUp)
            {
                return [
                    OracleDealerStringSelectElementOption.PeakAtCards,
                    OracleDealerStringSelectElementOption.EditNotes,
                ];
            }
        }

        // There's still more cards to reveal
        if (hasFaceDownCard)
        {
            return [
                OracleDealerStringSelectElementOption.PeakAtCards,
                OracleDealerStringSelectElementOption.RevealNextCard,
                OracleDealerStringSelectElementOption.EditNotes,
            ];
        }

        // All cards are accepted/rejected/questioned
        return [
            OracleDealerStringSelectElementOption.EditNotes,
            OracleDealerStringSelectElementOption.RevealFullProphecy,
        ];
    }
}
