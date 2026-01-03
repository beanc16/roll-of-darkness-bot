import { Text } from '@beanc16/discordjs-helpers';
import {
    type ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';

import { BaseCustomModal, type InputValuesMap } from '../../../../../modals/BaseCustomModal.js';
import { PtuFakemonPseudoCache } from '../../../dal/PtuFakemonPseudoCache.js';
import { getLookupMovesEmbedMessages } from '../../../embed-messages/lookup.js';
import { PtuMove } from '../../../models/PtuMove.js';
import { PtuSubcommandGroup } from '../../../options/index.js';
import { PtuLookupSubcommand } from '../../../options/lookup.js';
import { FakemonMoveManagerService } from '../../../services/FakemonDataManagers/FakemonMoveManagerService.js';
import { FakemonInteractionManagerService } from '../../../services/FakemonInteractionManagerService/FakemonInteractionManagerService.js';
import { FakemonInteractionManagerPage } from '../../../services/FakemonInteractionManagerService/types.js';
import type { LookupMoveStrategy } from '../../../strategies/lookup/LookupMoveStrategy.js';
import { PtuStrategyMap } from '../../../types/strategies.js';

enum FakemonMoveLevelUpAddingCustomId
{
    MoveName = 'fakemon-level-up-move-name',
    Level = 'fakemon-level-up-move-level',
}

enum FakemonMoveLevelUpAddingLabel
{
    MoveName = 'Move Name',
    Level = 'Level',
}

export class FakemonMoveLevelUpAddingModal extends BaseCustomModal
{
    public static id = 'fakemon-add-level-up-move-modal';
    public static title = 'Add Level Up Move';
    protected static inputValuesMap: InputValuesMap = {
        [FakemonMoveLevelUpAddingCustomId.MoveName]: [
            {
                key: FakemonMoveLevelUpAddingCustomId.MoveName,
                label: FakemonMoveLevelUpAddingLabel.MoveName,
                value: '',
                typeOfValue: 'string',
            },
        ],
        [FakemonMoveLevelUpAddingCustomId.Level]: [
            {
                key: FakemonMoveLevelUpAddingCustomId.Level,
                label: FakemonMoveLevelUpAddingLabel.Level,
                value: '',
                typeOfValue: 'string',
            },
        ],
    };

    protected static styleMap = {
        [FakemonMoveLevelUpAddingCustomId.MoveName]: TextInputStyle.Short,
        [FakemonMoveLevelUpAddingCustomId.Level]: TextInputStyle.Short,
    };

    public static getTextInputs(): TextInputBuilder[]
    {
        const moveNameInput = new TextInputBuilder()
            .setCustomId(FakemonMoveLevelUpAddingCustomId.MoveName)
            .setLabel(FakemonMoveLevelUpAddingLabel.MoveName)
            .setStyle(this.styleMap[FakemonMoveLevelUpAddingCustomId.MoveName])
            .setMinLength(0)
            .setMaxLength(FakemonMoveManagerService.MAX_MOVE_NAME_LENGTH)
            .setRequired(true);

        const moveLevelInput = new TextInputBuilder()
            .setCustomId(FakemonMoveLevelUpAddingCustomId.Level)
            .setLabel(FakemonMoveLevelUpAddingLabel.Level)
            .setStyle(this.styleMap[FakemonMoveLevelUpAddingCustomId.Level])
            .setMinLength(1)
            .setMaxLength(3)
            .setRequired(true);

        return [
            moveNameInput,
            moveLevelInput,
        ];
    }

    public static async run(interaction: ModalSubmitInteraction): Promise<void>
    {
        // Parse input
        const { messageId, strategies } = this.inputData as {
            messageId: string;
            strategies: PtuStrategyMap;
        };
        const { [FakemonMoveLevelUpAddingCustomId.MoveName]: name, [FakemonMoveLevelUpAddingCustomId.Level]: level } = this.parseInput<FakemonMoveLevelUpAddingCustomId>(interaction) as {
            [FakemonMoveLevelUpAddingCustomId.MoveName]: string;
            [FakemonMoveLevelUpAddingCustomId.Level]: string;
        };
        const parsedLevel = parseInt(level, 10);

        // Get fakemon
        const fakemon = PtuFakemonPseudoCache.getByMessageId(messageId);
        if (!fakemon)
        {
            throw new Error('Fakemon not found');
        }

        // Defer update to allow for database transaction
        await interaction.deferUpdate();

        // Look up the move name to see if it's valid
        const exactMatchMove = await this.lookupMove({
            interaction,
            name,
            strategies,
        });

        // Update database
        try
        {
            await FakemonMoveManagerService.addLevelUpMove({
                messageId,
                fakemon,
                move: {
                    move: name,
                    // Type the level as a number if possible
                    level: Number.isNaN(parsedLevel) ? level : parsedLevel,
                    type: exactMatchMove?.type ? exactMatchMove.type : 'Unknown',
                },
            });
        }
        catch (error)
        {
            const errorMessage = (error as Error)?.message;
            await interaction.followUp({
                content: [
                    `Failed to update fakemon${errorMessage ? ' with error:' : ''}`,
                    ...(errorMessage ? [Text.Code.multiLine(errorMessage)] : []),
                ].join('\n'),
                ephemeral: true,
            });
            return;
        }

        // Update message
        await FakemonInteractionManagerService.navigateTo({
            interaction,
            page: FakemonInteractionManagerPage.LevelUpMoves,
            messageId,
        });
    }

    private static async lookupMove({
        interaction,
        name,
        strategies,
    }: {
        interaction: ModalSubmitInteraction;
        name: string;
        strategies: PtuStrategyMap;
    }): Promise<PtuMove | undefined>
    {
        const MoveStrategy = strategies[PtuSubcommandGroup.Lookup][PtuLookupSubcommand.Move] as typeof LookupMoveStrategy;

        // Look up the move name to see if it's valid
        let exactMatchMove: PtuMove | undefined;
        let searchMoves: PtuMove[] = [];
        let lookupError: unknown;
        try
        {
            const [exactMoves, nameSearchMoves] = await Promise.all([
                MoveStrategy.getLookupData({
                    names: [name.trim()],
                }),
                MoveStrategy.getLookupData({
                    nameSearch: name.trim(),
                }),
            ]);
            // eslint-disable-next-line prefer-destructuring -- We want to set a variable outside the scope of this block easily
            exactMatchMove = exactMoves[0];
            searchMoves = nameSearchMoves;
        }
        catch (error)
        {
            lookupError = error;
        }
        if (lookupError || !exactMatchMove)
        {
            const searchMoveEmbeds = getLookupMovesEmbedMessages(searchMoves || []);
            const errorMessage = (lookupError as Error)?.message;
            await interaction.followUp({
                content: [
                    [
                        `Failed to find a move named \`${name}\`, attempting to add it anyways.`,
                        `Consider renaming it to a valid move${searchMoveEmbeds.length > 0 ? ', starting with the searched moves below' : ''}.`,
                        ...(errorMessage ? ['Error:'] : []),
                    ].join(' '),
                    ...(errorMessage ? [Text.Code.multiLine(errorMessage)] : []),
                ].join('\n'),
                ephemeral: true,
                // TODO: Maybe make this a paginated list like it is for lookups?
                ...(searchMoveEmbeds.length > 0 ? { embeds: searchMoveEmbeds } : {}),
            });
        }

        return exactMatchMove;
    }
}
