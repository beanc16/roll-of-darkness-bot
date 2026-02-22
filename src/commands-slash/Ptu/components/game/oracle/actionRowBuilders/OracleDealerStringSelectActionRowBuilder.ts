import { ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';

import {
    PtuOracleCardAction,
    PtuOracleGameTime,
    PtuOraclePlayerHandDetailed,
} from '../../../../dal/models/PtuOracleGameCollection.js';
import { constructOracleGameCustomId } from '../utils/oracleCustomIdUtils.js';
import { OracleStringSelectCustomId } from './types.js';

export enum OracleDealerStringSelectElementOption
{
    DealCards = 'Deal Cards',
    PeakAtCards = 'Peak At Cards',
    RevealNextCard = 'Reveal Next Card',
    EditNotes = 'Edit Notes (optional)',
    RevealFullProphecy = 'Reveal Full Prophecy',
}

export class OracleDealerStringSelectActionRowBuilder extends ActionRowBuilder<StringSelectMenuBuilder>
{
    constructor(oracleGameId: string, currentHand: PtuOraclePlayerHandDetailed | undefined)
    {
        const options = OracleDealerStringSelectActionRowBuilder.getOptions(currentHand);

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

    private static getOptions(currentHand: PtuOraclePlayerHandDetailed | undefined): OracleDealerStringSelectElementOption[]
    {
        if (!currentHand)
        {
            return [];
        }

        // Hand is not yet dealt
        if (
            currentHand[PtuOracleGameTime.Past].length === 0
            && currentHand[PtuOracleGameTime.Present].length === 0
            && currentHand[PtuOracleGameTime.Future].length === 0
        )
        {
            return [OracleDealerStringSelectElementOption.DealCards];
        }

        if (currentHand.isCompleted)
        {
            return [OracleDealerStringSelectElementOption.EditNotes];
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
