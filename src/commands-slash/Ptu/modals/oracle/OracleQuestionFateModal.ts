import { Text } from '@beanc16/discordjs-helpers';
import {
    type ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';

import { BaseCustomModal, type InputValuesMap } from '../../../../modals/BaseCustomModal.js';
import { PtuOracleGameCollection } from '../../dal/models/PtuOracleGameCollection.js';
import { OracleHandManagerService } from '../../services/OracleDataManagers/OracleHandManagerService.js';
import { OracleInteractionManagerService } from '../../services/OracleInteractionManagerService/OracleInteractionManagerService.js';
import { OracleInteractionManagerPage } from '../../services/OracleInteractionManagerService/types.js';

enum OracleQuestionFateCustomId
{
    Question = 'Question',
}

export class OracleQuestionFateModal extends BaseCustomModal
{
    public static id = 'oracle-question-fate-modal';
    public static title = 'Oracle - Question Fate';
    protected static inputValuesMap: InputValuesMap = {
        [OracleQuestionFateCustomId.Question]: [
            {
                key: OracleQuestionFateCustomId.Question,
                label: OracleQuestionFateCustomId.Question,
                value: '',
                typeOfValue: 'string',
            },
        ],
    };

    protected static styleMap = {
        [OracleQuestionFateCustomId.Question]: TextInputStyle.Paragraph,
    };

    public static getTextInputs(): TextInputBuilder[]
    {
        const questionInput = new TextInputBuilder()
            .setCustomId(OracleQuestionFateCustomId.Question)
            .setLabel(OracleQuestionFateCustomId.Question)
            .setStyle(this.styleMap[OracleQuestionFateCustomId.Question])
            .setMinLength(1)
            .setMaxLength(200)
            .setRequired(true);

        return [
            questionInput,
        ];
    }

    public static async run(interaction: ModalSubmitInteraction): Promise<void>
    {
        // Parse input
        const { game } = this.inputData as {
            game: PtuOracleGameCollection;
        };
        const {
            [OracleQuestionFateCustomId.Question]: {
                [OracleQuestionFateCustomId.Question]: question,
            },
        } = this.parseInput<OracleQuestionFateCustomId>(interaction) as {
            [OracleQuestionFateCustomId.Question]: {
                [OracleQuestionFateCustomId.Question]: string;
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
            updatedGame = await OracleHandManagerService.questionFate(game, question);
        }
        catch (error)
        {
            const errorMessage = (error as Error)?.message;
            await interaction.followUp({
                content: [
                    `Failed to question fate${errorMessage ? ' with error:' : ''}`,
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
