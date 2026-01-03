import { Text } from '@beanc16/discordjs-helpers';
import {
    type ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';

import { BaseCustomModal, type InputValuesMap } from '../../../../../modals/BaseCustomModal.js';
import { PtuFakemonCollection } from '../../../dal/models/PtuFakemonCollection.js';
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

enum FakemonMoveLevelUpEditingCustomId
{
    MoveName = 'fakemon-level-up-move-name',
    Level = 'fakemon-level-up-move-level',
}

enum FakemonMoveLevelUpEditingLabel
{
    MoveName = 'Move Name',
    Level = 'Level',
}

export class FakemonMoveLevelUpEditingModal extends BaseCustomModal
{
    public static id = 'fakemon-edit-level-up-move-modal';
    public static title = 'Edit Level Up Move';
    protected static inputValuesMap: InputValuesMap = {
        [FakemonMoveLevelUpEditingCustomId.MoveName]: [
            {
                key: FakemonMoveLevelUpEditingCustomId.MoveName,
                label: FakemonMoveLevelUpEditingLabel.MoveName,
                value: '',
                typeOfValue: 'string',
            },
        ],
        [FakemonMoveLevelUpEditingCustomId.Level]: [
            {
                key: FakemonMoveLevelUpEditingCustomId.Level,
                label: FakemonMoveLevelUpEditingLabel.Level,
                value: '',
                typeOfValue: 'string',
            },
        ],
    };

    protected static styleMap = {
        [FakemonMoveLevelUpEditingCustomId.MoveName]: TextInputStyle.Short,
        [FakemonMoveLevelUpEditingCustomId.Level]: TextInputStyle.Short,
    };

    public static getTextInputs(): TextInputBuilder[]
    {
        const moveNameInput = new TextInputBuilder()
            .setCustomId(FakemonMoveLevelUpEditingCustomId.MoveName)
            .setLabel(FakemonMoveLevelUpEditingLabel.MoveName)
            .setStyle(this.styleMap[FakemonMoveLevelUpEditingCustomId.MoveName])
            .setMinLength(0)
            .setMaxLength(FakemonMoveManagerService.MAX_MOVE_NAME_LENGTH)
            .setRequired(true);

        const moveLevelInput = new TextInputBuilder()
            .setCustomId(FakemonMoveLevelUpEditingCustomId.Level)
            .setLabel(FakemonMoveLevelUpEditingLabel.Level)
            .setStyle(this.styleMap[FakemonMoveLevelUpEditingCustomId.Level])
            .setMinLength(1)
            .setMaxLength(3)
            .setRequired(true);

        // Get previous move
        const { oldMove } = this.inputData as {
            oldMove: PtuFakemonCollection['moveList']['levelUp'][number] | undefined;
        };

        // Set default values
        if (oldMove)
        {
            moveNameInput.setValue(oldMove.move);
            moveLevelInput.setValue(oldMove.level.toString());
        }

        return [
            moveNameInput,
            moveLevelInput,
        ];
    }

    public static async run(interaction: ModalSubmitInteraction): Promise<void>
    {
        // Parse input
        const {
            messageId,
            strategies,
            oldMove,
        } = this.inputData as {
            messageId: string;
            strategies: PtuStrategyMap;
            oldMove: PtuFakemonCollection['moveList']['levelUp'][number];
        };
        const { [FakemonMoveLevelUpEditingCustomId.MoveName]: name, [FakemonMoveLevelUpEditingCustomId.Level]: level } = this.parseInput<FakemonMoveLevelUpEditingCustomId>(interaction) as {
            [FakemonMoveLevelUpEditingCustomId.MoveName]: string;
            [FakemonMoveLevelUpEditingCustomId.Level]: string;
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
            await FakemonMoveManagerService.editLevelUpMove({
                messageId,
                fakemon,
                oldMove,
                newMove: {
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
                        `Failed to find a move named \`${name}\`, attempting to edit it anyways.`,
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
