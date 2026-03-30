import { Text } from '@beanc16/discordjs-helpers';
import { logger } from '@beanc16/logger';
import {
    ChatInputCommandInteraction,
    StringSelectMenuInteraction,
    User,
} from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { BaseCustomModal } from '../../../../modals/BaseCustomModal.js';
import { Timer } from '../../../../services/Timer/Timer.js';
import { OracleDealerStringSelectElementOption } from '../../components/game/oracle/actionRowBuilders/OracleDealerStringSelectActionRowBuilder.js';
import { OraclePlayerStringSelectElementOption } from '../../components/game/oracle/actionRowBuilders/OraclePlayerStringSelectActionRowBuilder.js';
import { OracleStringSelectCustomId } from '../../components/game/oracle/actionRowBuilders/types.js';
import { deconstructOracleGameCustomId, OracleGameCustomId } from '../../components/game/oracle/utils/oracleCustomIdUtils.js';
import {
    PtuOracleGameCollection,
    PtuOracleGameStatus,
    PtuOracleGameTime,
} from '../../dal/models/PtuOracleGameCollection.js';
import { PtuOraclePseudoCache } from '../../dal/PtuOraclePseudoCache.js';
import { OracleEditNotesModal } from '../../modals/oracle/OracleEditNotesModal.js';
import { OracleQuestionFateModal } from '../../modals/oracle/OracleQuestionFateModal.js';
import { OracleSetTopicModal } from '../../modals/oracle/OracleSetTopicModal.js';
import { PtuGameSubcommand } from '../../options/game.js';
import { OracleHandManagerService } from '../../services/OracleDataManagers/OracleHandManagerService.js';
import { OracleInteractionManagerService } from '../../services/OracleInteractionManagerService/OracleInteractionManagerService.js';
import { OracleInteractionManagerPage } from '../../services/OracleInteractionManagerService/types.js';
import type { PtuChatIteractionStrategy, PtuStringSelectMenuIteractionStrategy } from '../../types/strategies.js';

interface FakemonCreateGetParameterResults
{
    name: string;
    players: User[];
}

@staticImplements<
    PtuChatIteractionStrategy
    & PtuStringSelectMenuIteractionStrategy
>()
export class OracleCreateStrategy
{
    public static key = PtuGameSubcommand.Oracle_Create;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        const { name, players } = this.getOptions(interaction);

        // Initialize initial game data
        const game = await this.initializeGame({
            name,
            dealerDiscordUserId: interaction.user.id,
            players,
        });

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
        // strategies: PtuStrategyMap,
        // { message }: PtuStrategyMetadata,
    ): Promise<boolean>
    {
        const { customId, values } = interaction as {
            customId: OracleGameCustomId;
            values: OraclePlayerStringSelectElementOption[]
                | OracleDealerStringSelectElementOption[]
                | PtuOracleGameTime[];
        };

        // Get game and custom id
        const { oracleGameId, componentCustomId } = deconstructOracleGameCustomId(customId);

        // General callback to run if game is updated (rather than returning something specific)
        let updateGameCallback: (() => Promise<PtuOracleGameCollection>) | undefined;
        // Modal to show for certain cases
        let modalToShow: typeof BaseCustomModal | undefined;
        let game: PtuOracleGameCollection | undefined;
        let hasPermissionToRun = false;

        try
        {
            // Validates that game exists
            game = await PtuOraclePseudoCache.getGameById(oracleGameId);

            // Add small delay to minimize database errors
            await Timer.wait({ seconds: 0.3 });

            switch (componentCustomId)
            {
                case OracleStringSelectCustomId.PlayerAction:
                {
                    const [value1] = values as OraclePlayerStringSelectElementOption[];
                    switch (value1)
                    {
                        case OraclePlayerStringSelectElementOption.AcceptFate:
                            hasPermissionToRun = interaction.user.id === game.dealerDiscordUserId || game.playerDiscordUserIds.includes(interaction.user.id);
                            updateGameCallback = () => OracleHandManagerService.acceptFate(game!);
                            break;
                        case OraclePlayerStringSelectElementOption.DenyFate:
                            hasPermissionToRun = interaction.user.id === game.dealerDiscordUserId || game.playerDiscordUserIds.includes(interaction.user.id);
                            updateGameCallback = () => OracleHandManagerService.denyFate(game!);
                            break;
                        case OraclePlayerStringSelectElementOption.QuestionFate:
                            hasPermissionToRun = interaction.user.id === game.dealerDiscordUserId || game.playerDiscordUserIds.includes(interaction.user.id);
                            modalToShow = OracleQuestionFateModal;
                            break;
                        case OraclePlayerStringSelectElementOption.PlayNextRound:
                            hasPermissionToRun = true;
                            modalToShow = OracleSetTopicModal;
                            break;

                        default:
                            const typeCheck: never = value1;
                            throw new Error(`Unknown oracle player string select value: ${typeCheck}`);
                    }
                    break;
                }

                case OracleStringSelectCustomId.DealerAction:
                    const [value1] = values as OracleDealerStringSelectElementOption[];
                    hasPermissionToRun = interaction.user.id === game.dealerDiscordUserId;
                    switch (value1)
                    {
                        case OracleDealerStringSelectElementOption.DealCards:
                            updateGameCallback = () => OracleHandManagerService.dealCardsForCurrentHand(game!);
                            break;
                        case OracleDealerStringSelectElementOption.PeakAtCards:
                            // Defer for database update
                            await interaction.deferUpdate();

                            // Show cards only to dealer
                            await OracleInteractionManagerService.navigateTo({
                                interaction,
                                page: OracleInteractionManagerPage.Game,
                                interactionType: 'followUp',
                                game,
                                displayOptions: {
                                    ephemeral: true,
                                    showFaceDownCards: true,
                                },
                            });
                            // Update base game message
                            await OracleInteractionManagerService.navigateTo({
                                interaction,
                                page: OracleInteractionManagerPage.Game,
                                game,
                            });
                            break;
                        case OracleDealerStringSelectElementOption.RevealNextCard:
                            updateGameCallback = () => OracleHandManagerService.revealNextCard(game!);
                            break;
                        case OracleDealerStringSelectElementOption.EditNotes:
                            modalToShow = OracleEditNotesModal;
                            break;
                        case OracleDealerStringSelectElementOption.RevealFullProphecy:
                            updateGameCallback = () => OracleHandManagerService.revealFullProphecy(game!);
                            break;
                        case OracleDealerStringSelectElementOption.CompleteGame:
                            updateGameCallback = () => OracleHandManagerService.updateGameStatus(game!, PtuOracleGameStatus.Complete);
                            break;
                        case OracleDealerStringSelectElementOption.ResumeGame:
                            updateGameCallback = () => OracleHandManagerService.updateGameStatus(game!, PtuOracleGameStatus.Active);
                            break;

                        default:
                            const typeCheck: never = value1;
                            throw new Error(`Unknown oracle dealer string select value: ${typeCheck}`);
                    }
                    break;

                case OracleStringSelectCustomId.SecretlyRerollCard:
                    const [time] = values as PtuOracleGameTime[];
                    hasPermissionToRun = interaction.user.id === game.dealerDiscordUserId;

                    // Defer for database update
                    await interaction.deferUpdate();

                    // Check permission and safety rails
                    if (!hasPermissionToRun)
                    {
                        await interaction.followUp({
                            content: 'You do not have permission to run that action',
                            ephemeral: true,
                        });
                        return true;
                    }
                    if (!Object.values(PtuOracleGameTime).includes(time))
                    {
                        throw new Error(`Unknown secret dealer reroll string select value: ${time}`);
                    }

                    const updatedGame = await OracleHandManagerService.rerollCard(game, time);
                    await OracleInteractionManagerService.navigateTo({
                        interaction,
                        page: OracleInteractionManagerPage.Game,
                        interactionType: 'editReply',
                        game: updatedGame,
                        displayOptions: {
                            ephemeral: true,
                            showFaceDownCards: true,
                        },
                    });
                    break;

                default:
                    const typeCheck: never = componentCustomId;
                    throw new Error(`Unknown oracle string select customId: ${typeCheck}`);
            }
        }
        catch (error)
        {
            // Defer for database update
            await interaction.deferUpdate();

            logger.error('Failed to run ptu oracle string select action', error);
            const errorMessage = (error as Error)?.message;
            await interaction.followUp({
                content: [
                    `Failed to run that action${errorMessage ? ' with error:' : ''}`,
                    ...(errorMessage ? [Text.Code.multiLine(errorMessage)] : []),
                ].join('\n'),
                ephemeral: true,
            });
        }

        if (!hasPermissionToRun)
        {
            // Defer for database update
            await interaction.deferUpdate();

            await interaction.followUp({
                content: 'You do not have permission to run that action',
                ephemeral: true,
            });
            return true;
        }

        try
        {
            if (updateGameCallback)
            {
                // Defer for database update
                await interaction.deferUpdate();

                const updatedGame = await updateGameCallback();
                await OracleInteractionManagerService.navigateTo({
                    interaction,
                    page: OracleInteractionManagerPage.Game,
                    interactionType: 'editReply',
                    game: updatedGame,
                });
            }
            else if (modalToShow)
            {
                // Don't defer before showing a modal, as that will throw an error
                await modalToShow.showModal(interaction, {
                    game,
                });
            }
        }
        catch (error)
        {
            // Defer for database update
            await interaction.deferUpdate();

            const mongoError = 'error' in (error as Record<string, unknown>)
                ? (error as Record<string, unknown>).error
                : error;
            const errorMessage = (mongoError as Error)?.message;
            logger.error('Failed to update game', error);
            await interaction.followUp({
                content: [
                    `Failed to update game${errorMessage ? ' with error:' : ''}`,
                    ...(errorMessage ? [Text.Code.multiLine(errorMessage)] : []),
                ].join('\n'),
                ephemeral: true,
            });
        }

        return true;
    }

    private static getOptions(interaction: ChatInputCommandInteraction): FakemonCreateGetParameterResults
    {
        const name = interaction.options.getString('name', true);
        const players: User[] = [];

        for (let index = 1; index <= 9; index += 1)
        {
            const user = interaction.options.getUser(`player_${index}`);

            if (user)
            {
                players.push(user);
            }
        }

        return {
            name,
            players,
        };
    }

    private static async initializeGame({
        name,
        dealerDiscordUserId,
        players,
    }: {
        name: string;
        dealerDiscordUserId: string;
        players: User[];
    }): Promise<PtuOracleGameCollection>
    {
        const allCards = await PtuOraclePseudoCache.getAllCards();

        return await PtuOraclePseudoCache.createGame({
            name,
            dealerDiscordUserId,
            deckCardNumbers: allCards.map((card) => card.cardNumber),
            playerDiscordUserIds: players.map((player) => player.id),
        });
    }
}
