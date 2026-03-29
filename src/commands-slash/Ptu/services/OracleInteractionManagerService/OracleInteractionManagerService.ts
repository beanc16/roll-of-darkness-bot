import { InteractionManager, InteractionManagerNavigateToOptions } from '../../../../services/InteractionManager/InteractionManager.js';
import { InteractionManagerPage } from '../../../../services/InteractionManager/InteractionManagerPage.js';
import { OracleGamePage } from '../../components/game/oracle/pages/OracleGamePage.js';
import { PtuOracleGameCollection } from '../../dal/models/PtuOracleGameCollection.js';
import { OracleHandManagerService } from '../OracleDataManagers/OracleHandManagerService.js';
import { OracleInteractionManagerPage } from './types.js';

type OracleInteractionManagerNavigateToOptions = InteractionManagerNavigateToOptions<OracleInteractionManagerPage, {
    game: PtuOracleGameCollection;
    displayOptions?: ConstructorParameters<typeof OracleGamePage>[2];
}>;

/**
 * Service for handling interaction updates for the oracle
 * game subcommands. This consolidates the navigation logic
 * so that the embeds and components for each possible
 * navigation action remain consistent.
 */
export class OracleInteractionManagerService extends InteractionManager
{
    public static async navigateTo(options: OracleInteractionManagerNavigateToOptions): Promise<void>
    {
        const page = await this.getPage({
            page: options.page,
            game: options.game,
            displayOptions: {
                ...(options.displayOptions || {}),
                isFollowup: options.interactionType === 'followUp',
            },
        });
        await this.sendMessage<
            OracleInteractionManagerPage,
            { game: PtuOracleGameCollection }
        >(options, page);
    }

    private static async getPage(
        {
            game,
            page,
            displayOptions,
        }: Pick<OracleInteractionManagerNavigateToOptions, 'page'> & {
            game: PtuOracleGameCollection;
            displayOptions: ConstructorParameters<typeof OracleGamePage>[2];
        },
    ): Promise<InteractionManagerPage>
    {
        const currentHand = await OracleHandManagerService.getCurrentHandDetailed(game);

        switch (page)
        {
            case OracleInteractionManagerPage.Game:
                return new OracleGamePage(game, currentHand, displayOptions);

            default:
                const typeGuard: never = page;
                throw new Error(`Unhandled page: ${typeGuard}`);
        }
    }
}
