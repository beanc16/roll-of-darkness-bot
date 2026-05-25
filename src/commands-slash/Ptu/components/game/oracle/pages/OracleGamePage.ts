import { ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';

import { chunkArray } from '../../../../../../services/chunkArray/chunkArray.js';
import { InteractionManagerPage } from '../../../../../../services/InteractionManager/InteractionManagerPage.js';
import { PtuOracleCardCollection } from '../../../../dal/models/PtuOracleCardCollection.js';
import {
    PtuOracleGameCollection,
    PtuOracleGameTime,
    PtuOraclePlayerHandDetailed,
} from '../../../../dal/models/PtuOracleGameCollection.js';
import { OracleDealerStringSelectActionRowBuilder } from '../actionRowBuilders/OracleDealerStringSelectActionRowBuilder.js';
import { OraclePlayerStringSelectActionRowBuilder } from '../actionRowBuilders/OraclePlayerStringSelectActionRowBuilder.js';
import { OracleSecretDealerReplaceCardP2StringSelectActionRowBuilder } from '../actionRowBuilders/OracleSecretDealerReplaceCardP2StringSelectActionRowBuilder.js';
import { OracleSecretDealerReplaceCardStringSelectActionRowBuilder } from '../actionRowBuilders/OracleSecretDealerReplaceCardStringSelectActionRowBuilder.js';
import { OracleSecretDealerRerollCardStringSelectActionRowBuilder } from '../actionRowBuilders/OracleSecretDealerRerollCardStringSelectActionRowBuilder.js';
import { OracleStringSelectCustomId } from '../actionRowBuilders/types.js';
import { OracleGameEmbedMessage } from '../embeds/OracleGameEmbedMessage.js';

function getComponents(params: ConstructorParameters<typeof OracleGamePage>): ActionRowBuilder<StringSelectMenuBuilder>[]
{
    const [args, currentHand, options, additionalParams] = params;

    // Secret dealer-only components for picking a replacement card
    if (
        options?.showSelectReplacementCardDropdowns
        && additionalParams?.selectedGameTime
        && additionalParams?.cards
    )
    {
        const chunkedCards = chunkArray({
            array: additionalParams.cards,
            shouldMoveToNextChunk: (_, index) => index % 25 === 0 && index !== 0,
        });
        const normalProphecyCardNumbersAddedToDropdown = new Set<number>();
        return chunkedCards.map((chunkOfCards, index) =>
        {
            const indexToCustomIdKey: Record<
                number,
                OracleStringSelectCustomId.SelectReplacementCard1
                | OracleStringSelectCustomId.SelectReplacementCard2
                | OracleStringSelectCustomId.SelectReplacementCard3
                | OracleStringSelectCustomId.SelectReplacementCard4
                | OracleStringSelectCustomId.SelectReplacementCard5
            > = {
                0: OracleStringSelectCustomId.SelectReplacementCard1,
                1: OracleStringSelectCustomId.SelectReplacementCard2,
                2: OracleStringSelectCustomId.SelectReplacementCard3,
                3: OracleStringSelectCustomId.SelectReplacementCard4,
                4: OracleStringSelectCustomId.SelectReplacementCard5,
            };

            return new OracleSecretDealerReplaceCardP2StringSelectActionRowBuilder(
                args.id,
                additionalParams.selectedGameTime!,
                chunkOfCards,
                indexToCustomIdKey[index],
                normalProphecyCardNumbersAddedToDropdown,
            );
        });
    }

    // Secret, standard, dealer-only components
    if (options?.showFaceDownCards)
    {
        return [
            new OracleSecretDealerRerollCardStringSelectActionRowBuilder(args.id, currentHand),
            new OracleSecretDealerReplaceCardStringSelectActionRowBuilder(args.id, currentHand),
        ];
    }

    // Visible components for all
    return [
        new OraclePlayerStringSelectActionRowBuilder(args.id, currentHand, args.status),
        new OracleDealerStringSelectActionRowBuilder(args.id, currentHand, args.status),
    ];
}

export class OracleGamePage extends InteractionManagerPage
{
    constructor(
        args: PtuOracleGameCollection,
        currentHand: PtuOraclePlayerHandDetailed | undefined,
        options: ConstructorParameters<typeof OracleGameEmbedMessage>[2] & {
            ephemeral?: boolean;
            isFollowup?: boolean;
        } = OracleGameEmbedMessage.defaultOptions,
        additionalParams?: {
            selectedGameTime?: PtuOracleGameTime;
            cards?: PtuOracleCardCollection[];
        },
    )
    {
        super({
            components: getComponents([args, currentHand, options, additionalParams]),
            embeds: [
                new OracleGameEmbedMessage(args, currentHand, options),
            ],
            ephemeral: options.ephemeral,
        });
    }
}
