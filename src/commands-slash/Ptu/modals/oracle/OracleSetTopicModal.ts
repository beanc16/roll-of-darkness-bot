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

enum OracleSetTopicCustomId
{
    Topic = 'Topic',
    Examples = 'Examples (this field will not be read)',
}

export class OracleSetTopicModal extends BaseCustomModal
{
    public static id = 'oracle-set-topic-modal';
    public static title = 'Oracle - Set Topic';
    protected static inputValuesMap: InputValuesMap = {
        [OracleSetTopicCustomId.Topic]: [
            {
                key: OracleSetTopicCustomId.Topic,
                label: OracleSetTopicCustomId.Topic,
                value: '',
                typeOfValue: 'string',
            },
        ],
        [OracleSetTopicCustomId.Examples]: [
            {
                key: OracleSetTopicCustomId.Examples,
                label: OracleSetTopicCustomId.Examples,
                value: '',
                typeOfValue: 'string',
            },
        ],
    };

    protected static styleMap = {
        [OracleSetTopicCustomId.Topic]: TextInputStyle.Paragraph,
        [OracleSetTopicCustomId.Examples]: TextInputStyle.Paragraph,
    };

    public static getTextInputs(): TextInputBuilder[]
    {
        const questionInput = new TextInputBuilder()
            .setCustomId(OracleSetTopicCustomId.Topic)
            .setLabel(OracleSetTopicCustomId.Topic)
            .setStyle(this.styleMap[OracleSetTopicCustomId.Topic])
            .setMinLength(1)
            .setMaxLength(200)
            .setPlaceholder(
                'What people, question, topic, or intention are you seeking guidance, clarity, or reflection on?',
            )
            .setRequired(true);

        const exampleInput = new TextInputBuilder()
            .setCustomId(OracleSetTopicCustomId.Examples)
            .setLabel(OracleSetTopicCustomId.Examples)
            .setStyle(this.styleMap[OracleSetTopicCustomId.Examples])
            .setMinLength(1)
            .setMaxLength(400)
            .setValue([
                'Specific Examples:',
                '- Person: "Kali Abara"',
                '- Group: "The Seekers of the Eternal Paradise"',
                `- Question: "How will I know I'm on the path to saving the world?"`,
                '- Topic: "The Outer Gods"',
                '- Intention: "I want to find a Chosen One"',
                '',
                'Vague Examples:',
                '- "What do I need to know?"',
                '- "What should I focus on?"',
                '- "What is blocking me from moving forward?"',
                '- "How can I better understand <insert something here>"?',
            ].join('\n'));

        return [
            questionInput,
            exampleInput,
        ];
    }

    public static async run(interaction: ModalSubmitInteraction): Promise<void>
    {
        // Parse input
        const { game } = this.inputData as {
            game: PtuOracleGameCollection;
        };
        const {
            [OracleSetTopicCustomId.Topic]: {
                [OracleSetTopicCustomId.Topic]: topic,
            },
        } = this.parseInput<OracleSetTopicCustomId>(interaction) as {
            [OracleSetTopicCustomId.Topic]: {
                [OracleSetTopicCustomId.Topic]: string;
            };
            [OracleSetTopicCustomId.Examples]: {
                [OracleSetTopicCustomId.Examples]: string;
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
            updatedGame = await OracleHandManagerService.createNewHand({
                ...game,
                id: game.id.toString(),
            } as typeof game, { topic, playerDiscordUserId: interaction.user.id });
        }
        catch (error)
        {
            const errorMessage = (error as Error)?.message;
            await interaction.followUp({
                content: [
                    `Failed to set topic${errorMessage ? ' with error:' : ''}`,
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
