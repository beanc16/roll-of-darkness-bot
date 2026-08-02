import { Text } from '@beanc16/discordjs-helpers';
import {
    type ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';

import { BaseCustomModal, type InputValuesMap } from '../../../../modals/BaseCustomModal.js';
import {
    PtuOracleCardAction,
    PtuOracleCardDraw,
    PtuOracleGameCollection,
    PtuOracleGameTime,
} from '../../dal/models/PtuOracleGameCollection.js';
import { OracleHandManagerService } from '../../services/OracleDataManagers/OracleHandManagerService.js';
import { OracleInteractionManagerService } from '../../services/OracleInteractionManagerService/OracleInteractionManagerService.js';
import { OracleInteractionManagerPage } from '../../services/OracleInteractionManagerService/types.js';

enum OracleEditNotesCustomId
{
    Past = 'Past Prophecy',
    Present = 'Present Prophecy',
    Future = 'Future Prophecy',
    Questioned = 'Questioned Prophecy',
    Denied = 'Denied Prophecy',
}

export class OracleEditNotesModal extends BaseCustomModal
{
    public static id = 'oracle-edit-notes-modal';
    public static title = 'Oracle - Edit Notes';
    protected static inputValuesMap: InputValuesMap = {
        [OracleEditNotesCustomId.Past]: [
            {
                key: OracleEditNotesCustomId.Past,
                label: OracleEditNotesCustomId.Past,
                value: '',
                typeOfValue: 'string',
            },
        ],
        [OracleEditNotesCustomId.Present]: [
            {
                key: OracleEditNotesCustomId.Present,
                label: OracleEditNotesCustomId.Present,
                value: '',
                typeOfValue: 'string',
            },
        ],
        [OracleEditNotesCustomId.Future]: [
            {
                key: OracleEditNotesCustomId.Future,
                label: OracleEditNotesCustomId.Future,
                value: '',
                typeOfValue: 'string',
            },
        ],
        [OracleEditNotesCustomId.Questioned]: [
            {
                key: OracleEditNotesCustomId.Questioned,
                label: OracleEditNotesCustomId.Questioned,
                value: '',
                typeOfValue: 'string',
            },
        ],
        [OracleEditNotesCustomId.Denied]: [
            {
                key: OracleEditNotesCustomId.Denied,
                label: OracleEditNotesCustomId.Denied,
                value: '',
                typeOfValue: 'string',
            },
        ],
    };

    protected static styleMap = {
        [OracleEditNotesCustomId.Past]: TextInputStyle.Paragraph,
        [OracleEditNotesCustomId.Present]: TextInputStyle.Paragraph,
        [OracleEditNotesCustomId.Future]: TextInputStyle.Paragraph,
        [OracleEditNotesCustomId.Questioned]: TextInputStyle.Paragraph,
        [OracleEditNotesCustomId.Denied]: TextInputStyle.Paragraph,
    };

    public static getTextInputs(): TextInputBuilder[]
    {
        const pastInput = new TextInputBuilder()
            .setCustomId(OracleEditNotesCustomId.Past)
            .setLabel(OracleEditNotesCustomId.Past)
            .setStyle(this.styleMap[OracleEditNotesCustomId.Past])
            .setMinLength(1)
            .setMaxLength(200)
            .setRequired(false);

        const presentInput = new TextInputBuilder()
            .setCustomId(OracleEditNotesCustomId.Present)
            .setLabel(OracleEditNotesCustomId.Present)
            .setStyle(this.styleMap[OracleEditNotesCustomId.Present])
            .setMinLength(0)
            .setMaxLength(200)
            .setRequired(false);

        const futureInput = new TextInputBuilder()
            .setCustomId(OracleEditNotesCustomId.Future)
            .setLabel(OracleEditNotesCustomId.Future)
            .setStyle(this.styleMap[OracleEditNotesCustomId.Future])
            .setMinLength(0)
            .setMaxLength(200)
            .setRequired(false);

        const questionedInput = new TextInputBuilder()
            .setCustomId(OracleEditNotesCustomId.Questioned)
            .setLabel(OracleEditNotesCustomId.Questioned)
            .setStyle(this.styleMap[OracleEditNotesCustomId.Questioned])
            .setMinLength(0)
            .setMaxLength(200)
            .setRequired(false);

        const deniedInput = new TextInputBuilder()
            .setCustomId(OracleEditNotesCustomId.Denied)
            .setLabel(OracleEditNotesCustomId.Denied)
            .setStyle(this.styleMap[OracleEditNotesCustomId.Denied])
            .setMinLength(0)
            .setMaxLength(200)
            .setRequired(false);

        // Set default values
        const { game } = this.inputData as {
            game: PtuOracleGameCollection;
        };
        const currentHand = OracleHandManagerService.getCurrentHand(game);

        if (!currentHand)
        {
            return [
                pastInput,
                presentInput,
                futureInput,
                questionedInput,
                deniedInput,
            ];
        }

        const setValue = (
            card: PtuOracleCardDraw,
            input: TextInputBuilder,
        ): void =>
        {
            if (card.action === PtuOracleCardAction.Denied)
            {
                deniedInput.setValue(card.prophecy);
            }
            else if (card.action === PtuOracleCardAction.Questioned)
            {
                questionedInput.setValue(card.prophecy);
            }
            else
            {
                input.setValue(card.prophecy);
            }
        };

        // Set values
        currentHand[PtuOracleGameTime.Past].forEach(card => setValue(card, pastInput));
        currentHand[PtuOracleGameTime.Present].forEach(card => setValue(card, presentInput));
        currentHand[PtuOracleGameTime.Future].forEach(card => setValue(card, futureInput));

        return [
            pastInput,
            presentInput,
            futureInput,
            questionedInput,
            deniedInput,
        ];
    }

    public static async run(interaction: ModalSubmitInteraction): Promise<void>
    {
        // Parse input
        const { game } = this.inputData as {
            game: PtuOracleGameCollection;
        };
        const {
            [OracleEditNotesCustomId.Past]: {
                [OracleEditNotesCustomId.Past]: past,
            },
            [OracleEditNotesCustomId.Present]: {
                [OracleEditNotesCustomId.Present]: present,
            },
            [OracleEditNotesCustomId.Future]: {
                [OracleEditNotesCustomId.Future]: future,
            },
            [OracleEditNotesCustomId.Questioned]: {
                [OracleEditNotesCustomId.Questioned]: questioned,
            },
            [OracleEditNotesCustomId.Denied]: {
                [OracleEditNotesCustomId.Denied]: denied,
            },
        } = this.parseInput<OracleEditNotesCustomId>(interaction) as {
            [OracleEditNotesCustomId.Past]: {
                [OracleEditNotesCustomId.Past]: string;
            };
            [OracleEditNotesCustomId.Present]: {
                [OracleEditNotesCustomId.Present]: string;
            };
            [OracleEditNotesCustomId.Future]: {
                [OracleEditNotesCustomId.Future]: string;
            };
            [OracleEditNotesCustomId.Questioned]: {
                [OracleEditNotesCustomId.Questioned]: string;
            };
            [OracleEditNotesCustomId.Denied]: {
                [OracleEditNotesCustomId.Denied]: string;
            };
        };

        // Input guard
        if (!game)
        {
            throw new Error('Game not found');
        }

        // Defer update to allow for database transaction
        await interaction.deferUpdate();

        // Update database
        let updatedGame = game;
        try
        {
            updatedGame = await OracleHandManagerService.editCurrentHandsProphecies(game, {
                past,
                present,
                future,
                questioned,
                denied,
            });
        }
        catch (error)
        {
            const errorMessage = (error as Error)?.message;
            await interaction.followUp({
                content: [
                    `Failed to update prophecies${errorMessage ? ' with error:' : ''}`,
                    ...(errorMessage ? [Text.Code.multiLine(errorMessage)] : []),
                ].join('\n'),
                ephemeral: true,
            });
            return;
        }

        // Update message
        await OracleInteractionManagerService.navigateTo({
            interaction,
            page: OracleInteractionManagerPage.Game,
            interactionType: 'editReply',
            game: updatedGame,
        });
    }
}
