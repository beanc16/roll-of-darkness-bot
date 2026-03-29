import { ChatInputCommandInteraction, StringSelectMenuInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { PtuOraclePseudoCache } from '../../dal/PtuOraclePseudoCache.js';
import { PtuGameSubcommand } from '../../options/game.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import { OracleInteractionManagerService } from '../../services/OracleInteractionManagerService/OracleInteractionManagerService.js';
import { OracleInteractionManagerPage } from '../../services/OracleInteractionManagerService/types.js';
import { PtuAutocompleteParameterName } from '../../types/autocomplete.js';
import type {
    PtuChatIteractionStrategy,
    PtuStrategyMap,
    PtuStrategyMetadata,
    PtuStringSelectMenuIteractionStrategy,
} from '../../types/strategies.js';

interface FakemonContinueGetParameterResults
{
    gameName: string;
}

@staticImplements<
    PtuChatIteractionStrategy
    & PtuStringSelectMenuIteractionStrategy
>()
export class OracleContinueStrategy
{
    public static key = PtuGameSubcommand.Oracle_Continue;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        const { gameName } = this.getOptions(interaction);

        // Initialize initial game data
        const game = await PtuOraclePseudoCache.getGameByName(gameName);

        // Send response
        await OracleInteractionManagerService.navigateTo({
            interaction,
            page: OracleInteractionManagerPage.Game,
            interactionType: 'editReply',
            game,
        });

        return true;
    }

    public static async runStringSelect(
        interaction: StringSelectMenuInteraction,
        strategies: PtuStrategyMap,
        metadata: PtuStrategyMetadata,
    ): Promise<boolean>
    {
        const strategy = strategies[PtuSubcommandGroup.Game][PtuGameSubcommand.Oracle_Create] as unknown as PtuStringSelectMenuIteractionStrategy;
        return await strategy?.runStringSelect(
            interaction,
            strategies,
            metadata,
        );
    }

    private static getOptions(interaction: ChatInputCommandInteraction): FakemonContinueGetParameterResults
    {
        const gameName = interaction.options.getString(PtuAutocompleteParameterName.OracleGameName, true);

        return { gameName };
    }
}
