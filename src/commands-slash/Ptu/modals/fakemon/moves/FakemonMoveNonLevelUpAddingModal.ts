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
import type { LookupMoveStrategy } from '../../../strategies/lookup/LookupMoveStrategy.js';
import { PtuStrategyMap } from '../../../types/strategies.js';

enum FakemonMoveNonLevelUpAddingCustomId
{
    Move1 = 'fakemon-non-level-up-move-1',
    Move2 = 'fakemon-non-level-up-move-2',
    Move3 = 'fakemon-non-level-up-move-3',
    Move4 = 'fakemon-non-level-up-move-4',
    Move5 = 'fakemon-non-level-up-move-5',
}

enum FakemonMoveNonLevelUpAddingLabel
{
    Move1 = 'Move 1',
    Move2 = 'Move 2',
    Move3 = 'Move 3',
    Move4 = 'Move 4',
    Move5 = 'Move 5',
}

export class FakemonMoveNonLevelUpAddingModal extends BaseCustomModal
{
    public static id = 'fakemon-add-non-level-up-move-modal';
    public static title = 'Add Moves';
    protected static inputValuesMap: InputValuesMap = {
        [FakemonMoveNonLevelUpAddingCustomId.Move1]: [
            {
                key: FakemonMoveNonLevelUpAddingCustomId.Move1,
                label: FakemonMoveNonLevelUpAddingLabel.Move1,
                value: '',
                typeOfValue: 'string',
            },
        ],
        [FakemonMoveNonLevelUpAddingCustomId.Move2]: [
            {
                key: FakemonMoveNonLevelUpAddingCustomId.Move2,
                label: FakemonMoveNonLevelUpAddingLabel.Move2,
                value: '',
                typeOfValue: 'string',
            },
        ],
        [FakemonMoveNonLevelUpAddingCustomId.Move3]: [
            {
                key: FakemonMoveNonLevelUpAddingCustomId.Move3,
                label: FakemonMoveNonLevelUpAddingLabel.Move3,
                value: '',
                typeOfValue: 'string',
            },
        ],
        [FakemonMoveNonLevelUpAddingCustomId.Move4]: [
            {
                key: FakemonMoveNonLevelUpAddingCustomId.Move4,
                label: FakemonMoveNonLevelUpAddingLabel.Move4,
                value: '',
                typeOfValue: 'string',
            },
        ],
        [FakemonMoveNonLevelUpAddingCustomId.Move5]: [
            {
                key: FakemonMoveNonLevelUpAddingCustomId.Move5,
                label: FakemonMoveNonLevelUpAddingLabel.Move5,
                value: '',
                typeOfValue: 'string',
            },
        ],
    };

    protected static styleMap = {
        [FakemonMoveNonLevelUpAddingCustomId.Move1]: TextInputStyle.Short,
        [FakemonMoveNonLevelUpAddingCustomId.Move2]: TextInputStyle.Short,
        [FakemonMoveNonLevelUpAddingCustomId.Move3]: TextInputStyle.Short,
        [FakemonMoveNonLevelUpAddingCustomId.Move4]: TextInputStyle.Short,
        [FakemonMoveNonLevelUpAddingCustomId.Move5]: TextInputStyle.Short,
    };

    public static getTextInputs(): TextInputBuilder[]
    {
        const move1Input = new TextInputBuilder()
            .setCustomId(FakemonMoveNonLevelUpAddingCustomId.Move1)
            .setLabel(FakemonMoveNonLevelUpAddingLabel.Move1)
            .setStyle(this.styleMap[FakemonMoveNonLevelUpAddingCustomId.Move1])
            .setMinLength(1)
            .setMaxLength(FakemonMoveManagerService.MAX_MOVE_NAME_LENGTH)
            .setRequired(true);

        const move2Input = new TextInputBuilder()
            .setCustomId(FakemonMoveNonLevelUpAddingCustomId.Move2)
            .setLabel(FakemonMoveNonLevelUpAddingLabel.Move2)
            .setStyle(this.styleMap[FakemonMoveNonLevelUpAddingCustomId.Move2])
            .setMinLength(0)
            .setMaxLength(FakemonMoveManagerService.MAX_MOVE_NAME_LENGTH)
            .setRequired(false);

        const move3Input = new TextInputBuilder()
            .setCustomId(FakemonMoveNonLevelUpAddingCustomId.Move3)
            .setLabel(FakemonMoveNonLevelUpAddingLabel.Move3)
            .setStyle(this.styleMap[FakemonMoveNonLevelUpAddingCustomId.Move3])
            .setMinLength(0)
            .setMaxLength(FakemonMoveManagerService.MAX_MOVE_NAME_LENGTH)
            .setRequired(false);

        const move4Input = new TextInputBuilder()
            .setCustomId(FakemonMoveNonLevelUpAddingCustomId.Move4)
            .setLabel(FakemonMoveNonLevelUpAddingLabel.Move4)
            .setStyle(this.styleMap[FakemonMoveNonLevelUpAddingCustomId.Move4])
            .setMinLength(0)
            .setMaxLength(FakemonMoveManagerService.MAX_MOVE_NAME_LENGTH)
            .setRequired(false);

        const move5Input = new TextInputBuilder()
            .setCustomId(FakemonMoveNonLevelUpAddingCustomId.Move5)
            .setLabel(FakemonMoveNonLevelUpAddingLabel.Move5)
            .setStyle(this.styleMap[FakemonMoveNonLevelUpAddingCustomId.Move5])
            .setMinLength(0)
            .setMaxLength(FakemonMoveManagerService.MAX_MOVE_NAME_LENGTH)
            .setRequired(false);

        return [
            move1Input,
            move2Input,
            move3Input,
            move4Input,
            move5Input,
        ];
    }

    public static async run(interaction: ModalSubmitInteraction): Promise<void>
    {
        // Parse input
        const {
            messageId,
            moveListToAddTo,
            strategies,
        } = this.inputData as {
            messageId: string;
            moveListToAddTo: 'eggMoves' | 'tmHm' | 'tutorMoves';
            strategies: PtuStrategyMap;
        };
        const {
            [FakemonMoveNonLevelUpAddingCustomId.Move1]: move1,
            [FakemonMoveNonLevelUpAddingCustomId.Move2]: move2,
            [FakemonMoveNonLevelUpAddingCustomId.Move3]: move3,
            [FakemonMoveNonLevelUpAddingCustomId.Move4]: move4,
            [FakemonMoveNonLevelUpAddingCustomId.Move5]: move5,
        } = this.parseInput<FakemonMoveNonLevelUpAddingCustomId>(interaction) as {
            [FakemonMoveNonLevelUpAddingCustomId.Move1]: string;
            [FakemonMoveNonLevelUpAddingCustomId.Move2]: string;
            [FakemonMoveNonLevelUpAddingCustomId.Move3]: string;
            [FakemonMoveNonLevelUpAddingCustomId.Move4]: string;
            [FakemonMoveNonLevelUpAddingCustomId.Move5]: string;
        };

        // Get fakemon
        const fakemon = PtuFakemonPseudoCache.getByMessageId(messageId);
        if (!fakemon)
        {
            throw new Error('Fakemon not found');
        }

        // Defer update to allow for database transaction
        await interaction.deferUpdate();

        // Lookup moves and show invalid move names
        await this.lookupMoves({
            interaction,
            namesMap: {
                [FakemonMoveNonLevelUpAddingCustomId.Move1]: move1,
                [FakemonMoveNonLevelUpAddingCustomId.Move2]: move2,
                [FakemonMoveNonLevelUpAddingCustomId.Move3]: move3,
                [FakemonMoveNonLevelUpAddingCustomId.Move4]: move4,
                [FakemonMoveNonLevelUpAddingCustomId.Move5]: move5,
            },
            strategies,
        });

        // Update database
        try
        {
            await FakemonMoveManagerService.addNonLevelUpMoves({
                messageId,
                fakemon,
                names: [
                    move1?.trim(),
                    move2?.trim(),
                    move3?.trim(),
                    move4?.trim(),
                    move5?.trim(),
                ].filter(Boolean),
                moveListToAddTo,
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
            page: FakemonMoveManagerService.getInteractionPageByMoveListKey(
                moveListToAddTo,
            ),
            messageId,
        });
    }

    private static async lookupMoves({
        interaction,
        namesMap,
        strategies,
    }: {
        interaction: ModalSubmitInteraction;
        namesMap: Record<FakemonMoveNonLevelUpAddingCustomId, string>;
        strategies: PtuStrategyMap;
    }): Promise<Record<FakemonMoveNonLevelUpAddingCustomId, PtuMove | undefined>>
    {
        const MoveStrategy = strategies[PtuSubcommandGroup.Lookup][PtuLookupSubcommand.Move] as typeof LookupMoveStrategy;

        const names = Object.values(namesMap).filter(Boolean);
        const hasMove1 = !!namesMap[FakemonMoveNonLevelUpAddingCustomId.Move1]?.trim();
        const hasMove2 = !!namesMap[FakemonMoveNonLevelUpAddingCustomId.Move2]?.trim();
        const hasMove3 = !!namesMap[FakemonMoveNonLevelUpAddingCustomId.Move3]?.trim();
        const hasMove4 = !!namesMap[FakemonMoveNonLevelUpAddingCustomId.Move4]?.trim();
        const hasMove5 = !!namesMap[FakemonMoveNonLevelUpAddingCustomId.Move5]?.trim();
        const indexToSubmittedMove: Record<number, boolean> = {
            0: hasMove1,
            1: hasMove2,
            2: hasMove3,
            3: hasMove4,
            4: hasMove5,
        };

        // Look up the move name to see if it's valid
        const exactMatchMoveMap: Record<FakemonMoveNonLevelUpAddingCustomId, PtuMove | undefined> = {
            [FakemonMoveNonLevelUpAddingCustomId.Move1]: undefined,
            [FakemonMoveNonLevelUpAddingCustomId.Move2]: undefined,
            [FakemonMoveNonLevelUpAddingCustomId.Move3]: undefined,
            [FakemonMoveNonLevelUpAddingCustomId.Move4]: undefined,
            [FakemonMoveNonLevelUpAddingCustomId.Move5]: undefined,
        };
        let searchMoves: PtuMove[] = [];
        let lookupError: unknown;
        try
        {
            // Perform lookups
            const [exactMoves, ...moveSearches] = await Promise.all([
                MoveStrategy.getLookupData({
                    names,
                }),
                ...(hasMove1
                    ? [MoveStrategy.getLookupData({
                        nameSearch: namesMap[FakemonMoveNonLevelUpAddingCustomId.Move1]?.trim(),
                    })]
                    : []),
                ...(hasMove2
                    ? [MoveStrategy.getLookupData({
                        nameSearch: namesMap[FakemonMoveNonLevelUpAddingCustomId.Move2]?.trim(),
                    })]
                    : []),
                ...(hasMove3
                    ? [MoveStrategy.getLookupData({
                        nameSearch: namesMap[FakemonMoveNonLevelUpAddingCustomId.Move3]?.trim(),
                    })]
                    : []),
                ...(hasMove4
                    ? [MoveStrategy.getLookupData({
                        nameSearch: namesMap[FakemonMoveNonLevelUpAddingCustomId.Move4]?.trim(),
                    })]
                    : []),
                ...(hasMove5
                    ? [MoveStrategy.getLookupData({
                        nameSearch: namesMap[FakemonMoveNonLevelUpAddingCustomId.Move5]?.trim(),
                    })]
                    : []),
            ]);

            // Set exact matches
            const indexToHasExactMoveMatch: Record<number, boolean> = {
                0: false,
                1: false,
                2: false,
                3: false,
                4: false,
            };
            exactMoves.forEach((move) =>
            {
                if (hasMove1 && move.name === namesMap[FakemonMoveNonLevelUpAddingCustomId.Move1]?.trim())
                {
                    exactMatchMoveMap[FakemonMoveNonLevelUpAddingCustomId.Move1] = move;
                    indexToHasExactMoveMatch[0] = true;
                }
                else if (hasMove2 && move.name === namesMap[FakemonMoveNonLevelUpAddingCustomId.Move2]?.trim())
                {
                    exactMatchMoveMap[FakemonMoveNonLevelUpAddingCustomId.Move2] = move;
                    indexToHasExactMoveMatch[1] = true;
                }
                else if (hasMove3 && move.name === namesMap[FakemonMoveNonLevelUpAddingCustomId.Move3]?.trim())
                {
                    exactMatchMoveMap[FakemonMoveNonLevelUpAddingCustomId.Move3] = move;
                    indexToHasExactMoveMatch[2] = true;
                }
                else if (hasMove4 && move.name === namesMap[FakemonMoveNonLevelUpAddingCustomId.Move4]?.trim())
                {
                    exactMatchMoveMap[FakemonMoveNonLevelUpAddingCustomId.Move4] = move;
                    indexToHasExactMoveMatch[3] = true;
                }
                else if (hasMove5 && move.name === namesMap[FakemonMoveNonLevelUpAddingCustomId.Move5]?.trim())
                {
                    exactMatchMoveMap[FakemonMoveNonLevelUpAddingCustomId.Move5] = move;
                    indexToHasExactMoveMatch[4] = true;
                }
            });

            // Set searches
            const searchMoveNames = new Set<string>();
            searchMoves = MoveStrategy.sortMoves(
                moveSearches.reduce<PtuMove[]>((acc, cur, index) =>
                {
                    // Only add moves that don't have an exact match
                    if (!indexToHasExactMoveMatch[index])
                    {
                        cur.forEach((move) =>
                        {
                            if (searchMoveNames.has(move.name))
                            {
                                return;
                            }
                            searchMoveNames.add(move.name);
                            acc.push(move);
                        });
                    }
                    return acc;
                }, []),
            );
        }
        catch (error)
        {
            lookupError = error;
        }

        const undefinedMoves = Object.entries(exactMatchMoveMap).filter(([_, move], index) => !move && indexToSubmittedMove[index]);
        if (lookupError || undefinedMoves.length > 0)
        {
            const searchMoveEmbeds = getLookupMovesEmbedMessages(searchMoves || []);
            const errorMessage = (lookupError as Error)?.message;
            await interaction.followUp({
                content: [
                    [
                        `Failed to find moves named \`${undefinedMoves.map(([customId]) => namesMap[customId as FakemonMoveNonLevelUpAddingCustomId]).filter(Boolean).join('`, `')}\`, attempting to add them anyways.`,
                        `Consider renaming them to a valid move${searchMoveEmbeds.length > 0 ? ', starting with the searched moves below' : ''}.`,
                        ...(errorMessage ? ['Error:'] : []),
                    ].join(' '),
                    ...(errorMessage ? [Text.Code.multiLine(errorMessage)] : []),
                ].join('\n'),
                ephemeral: true,
                ...(searchMoveEmbeds.length > 0 ? { embeds: searchMoveEmbeds } : {}),
            });
        }

        return exactMatchMoveMap;
    }
}
