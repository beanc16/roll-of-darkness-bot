import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { PaginationStrategy } from '../../../strategies/PaginationStrategy/PaginationStrategy.js';
import { OracleReadonlyGameEmbedMessage } from '../../components/game/oracle/embeds/OracleReadonlyGameEmbedMessage.js';
import { PtuOracleGameCollection, PtuOraclePlayerHandDetailed } from '../../dal/models/PtuOracleGameCollection.js';
import { PtuOraclePseudoCache } from '../../dal/PtuOraclePseudoCache.js';
import { PtuGameSubcommand } from '../../options/game.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import { OracleHandManagerService } from '../../services/OracleDataManagers/OracleHandManagerService.js';
import { PtuAutocompleteParameterName } from '../../types/autocomplete.js';
import type { PtuChatIteractionStrategy } from '../../types/strategies.js';

interface FakemonViewGetParameterResults
{
    gameName: string;
}

@staticImplements<PtuChatIteractionStrategy>()
export class OracleViewStrategy
{
    public static key = PtuGameSubcommand.Oracle_View;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        const { gameName } = this.getOptions(interaction);

        // Initialize initial game data
        const game = await PtuOraclePseudoCache.getGameByName(gameName);
        const detailedHands = await OracleHandManagerService.getHandsDetailed(game);

        // Send response
        const embeds = this.getEmbeds(game, detailedHands);
        await PaginationStrategy.run({
            originalInteraction: interaction,
            commandName: `/${interaction.commandName} ${PtuSubcommandGroup.Game} ${this.key}`,
            interactionType: 'editReply',
            embeds,
            includeDeleteButton: true,
        });

        return true;
    }

    private static getEmbeds(
        game: PtuOracleGameCollection,
        detailedHands: PtuOraclePlayerHandDetailed[],
    ): EmbedBuilder[]
    {
        return detailedHands.map((detailedHand, index) =>
            new OracleReadonlyGameEmbedMessage([game, detailedHand], index + 1),
        );
    }

    private static getOptions(interaction: ChatInputCommandInteraction): FakemonViewGetParameterResults
    {
        const gameName = interaction.options.getString(PtuAutocompleteParameterName.OracleGameName, true);

        return { gameName };
    }
}
