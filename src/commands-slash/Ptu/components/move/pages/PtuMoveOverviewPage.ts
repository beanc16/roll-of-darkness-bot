import { InteractionManagerPage } from '../../../../../services/InteractionManager/InteractionManagerPage.js';
import { PtuMoveCollection } from '../../../dal/models/PtuMoveCollection.js';
import { MoveInteractionManagerPage } from '../../../services/MoveInteractionManagerService/types.js';
import { PtuMoveOverviewButtonActionRowBuilder } from '../actionRowBuilders/overview/PtuMoveOverviewButtonActionRowBuilder.js';
import { PtuMoveOverviewEditStatusActionRowBuilder } from '../actionRowBuilders/overview/PtuMoveOverviewEditStatusActionRowBuilder.js';
import { PtuMoveOverviewNavigationActionRowBuilder } from '../actionRowBuilders/overview/PtuMoveOverviewNavigationActionRowBuilder.js';
import { PtuMoveOverviewEmbedMessage } from '../embeds/PtuMoveOverviewEmbedMessage.js';

export class PtuMoveOverviewPage extends InteractionManagerPage
{
    constructor(args: PtuMoveCollection)
    {
        super({
            components: [
                new PtuMoveOverviewButtonActionRowBuilder(),
                new PtuMoveOverviewEditStatusActionRowBuilder(),
                new PtuMoveOverviewNavigationActionRowBuilder(MoveInteractionManagerPage.Overview),
            ],
            embeds: [
                new PtuMoveOverviewEmbedMessage(args),
            ],
        });
    }
}
