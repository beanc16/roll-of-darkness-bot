import { InteractionManager, InteractionManagerNavigateToOptions } from '../../../../services/InteractionManager/InteractionManager.js';
import { InteractionManagerPage } from '../../../../services/InteractionManager/InteractionManagerPage.js';
import { PtuMoveOverviewPage } from '../../components/move/pages/PtuMoveOverviewPage.js';
import { PtuMoveCollection } from '../../dal/models/PtuMoveCollection.js';
import { MoveInteractionManagerPage } from './types.js';

type MoveInteractionManagerNavigateToOptions = InteractionManagerNavigateToOptions<MoveInteractionManagerPage, {
    move: PtuMoveCollection;
}>;

/**
 * Service for handling interaction updates for the ptu move
 * subcommands. This consolidates the navigation logic so
 * that the embeds and components for each possible
 * navigation action remain consistent.
 */
export class MoveInteractionManagerService extends InteractionManager
{
    public static async navigateTo(options: MoveInteractionManagerNavigateToOptions): Promise<void>
    {
        const page = this.getPage(options);
        await this.sendMessage<
            MoveInteractionManagerPage,
            { move: MoveInteractionManagerNavigateToOptions['move'] }
        >(options, page);
    }

    private static getPage(
        { move, page }: MoveInteractionManagerNavigateToOptions,
    ): InteractionManagerPage
    {
        switch (page)
        {
            case MoveInteractionManagerPage.Overview:
                return new PtuMoveOverviewPage(move);

            default:
                const typeGuard: never = page;
                throw new Error(`Unhandled page: ${typeGuard}`);
        }
    }
}
