import { InteractionManagerPage } from '../../../../../../services/InteractionManager/InteractionManagerPage.js';
import { PtuOracleGameCollection, PtuOraclePlayerHandDetailed } from '../../../../dal/models/PtuOracleGameCollection.js';
import { OracleDealerStringSelectActionRowBuilder } from '../actionRowBuilders/OracleDealerStringSelectActionRowBuilder.js';
import { OraclePlayerStringSelectActionRowBuilder } from '../actionRowBuilders/OraclePlayerStringSelectActionRowBuilder.js';
import { OracleSecretDealerRerollCardStringSelectActionRowBuilder } from '../actionRowBuilders/OracleSecretDealerRerollCardStringSelectActionRowBuilder.js';
import { OracleGameEmbedMessage } from '../embeds/OracleGameEmbedMessage.js';

export class OracleGamePage extends InteractionManagerPage
{
    constructor(
        args: PtuOracleGameCollection,
        currentHand: PtuOraclePlayerHandDetailed | undefined,
        options: ConstructorParameters<typeof OracleGameEmbedMessage>[2] & {
            ephemeral?: boolean;
            isFollowup?: boolean;
        } = OracleGameEmbedMessage.defaultOptions,
    )
    {
        super({
            components: options.showFaceDownCards
                ? [
                    // Secret dealer-only components
                    new OracleSecretDealerRerollCardStringSelectActionRowBuilder(args.id, currentHand),
                ]
                : [
                    // Visible components for all
                    new OraclePlayerStringSelectActionRowBuilder(args.id, currentHand),
                    new OracleDealerStringSelectActionRowBuilder(args.id, currentHand),
                ],
            embeds: [
                new OracleGameEmbedMessage(args, currentHand, options),
            ],
            ephemeral: options.ephemeral,
        });
    }
}
