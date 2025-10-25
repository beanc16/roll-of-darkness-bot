import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';

import { BaseCustomModal, InputValuesMap } from '../../../../modals/BaseCustomModal.js';
import { InteractionListenerRestartStyle, InteractionStrategy } from '../../../strategies/InteractionStrategy/InteractionStrategy.js';
import { NwodCalculateSubcommand } from '../../options/calculate.js';
import { NwodSubcommandGroup } from '../../options/index.js';

export enum CalculateHedgeDicepoolCustomIds
{
    TrodRating = 'trod-rating-input',
    CharactersWithPositiveConditions = 'chars-with-positive-conditions-input',
    CharactersWithNegativeConditions = 'chars-with-negative-conditions-input',
    Booleans1 = 'booleans-input-1',
    Booleans2 = 'booleans-input-2',
}

enum NonBooleanLabels
{
    TrodRating = `Trod Rating? (0-5; number)`,
    CharactersWithPositiveConditions = `Characters with positive conditions? (number)`,
    CharactersWithNegativeConditions = `Characters with negative conditions? (number)`,
}

enum BooleanQuestion
{
    CharacterHasHalfOrLowerClarity = `Any Clarity below half its max?`,
    CharactersHavePressingTimeLimit = `Pressing time limit?`,
    HedgeHasEdge = `Does the Hedge have the Edge?`,
    ChangelingIncitedBedlam = `Bedlam incited this scene?`,
    ChangelingIncitedBedlamWithExceptionalSuccess = `Bedlam w/ excep success incited this scene?`,
    CharactersInThorns = `In the Thorns?`,
}

enum TurnUpdateButtonName
{
    NextTurn = 'next_turn',
    PreviousTurn = 'previous_turn',
}

export interface ParseInputResponse
{
    trodRating: number;
    charactersWithPositiveConditions: number;
    charactersWithNegativeConditions: number;
    characterHasHalfOrLowerClarity: boolean;
    charactersHavePressingTimeLimit: boolean;
    hedgeHasEdge: boolean;
    changelingIncitedBedlam: boolean;
    changelingIncitedBedlamWithExceptionalSuccess: boolean;
    charactersInThorns: boolean;
    errorMessages: string[];
}

type BooleansKey = Exclude<
    keyof ParseInputResponse,
    'trodRating' | 'charactersWithPositiveConditions' | 'charactersWithNegativeConditions'
>;

interface CalculateHedgeDicepoolModalInputData
{
    successes: number;
}

export class CalculateHedgeDicepoolModal extends BaseCustomModal
{
    public static id = 'calculate-hedge-dicepool-modal';
    public static title = 'Calculate Hedge Dicepool';
    protected static inputValuesMap: InputValuesMap = {
        [CalculateHedgeDicepoolCustomIds.TrodRating]: [
            {
                key: CalculateHedgeDicepoolCustomIds.TrodRating,
                label: '',
                value: '0',
                typeOfValue: 'integer',
            },
        ],
        [CalculateHedgeDicepoolCustomIds.CharactersWithPositiveConditions]: [
            {
                key: CalculateHedgeDicepoolCustomIds.CharactersWithPositiveConditions,
                label: '',
                value: '0',
                typeOfValue: 'integer',
            },
        ],
        [CalculateHedgeDicepoolCustomIds.CharactersWithNegativeConditions]: [
            {
                key: CalculateHedgeDicepoolCustomIds.CharactersWithNegativeConditions,
                label: '',
                value: 'no',
                typeOfValue: 'integer',
            },
        ],
        [CalculateHedgeDicepoolCustomIds.Booleans1]: [
            {
                key: BooleanQuestion.CharacterHasHalfOrLowerClarity,
                label: BooleanQuestion.CharacterHasHalfOrLowerClarity,
                value: 'no',
                typeOfValue: 'boolean',
            },
            {
                key: BooleanQuestion.CharactersHavePressingTimeLimit,
                label: BooleanQuestion.CharactersHavePressingTimeLimit,
                value: 'no',
                typeOfValue: 'boolean',
            },
            {
                key: BooleanQuestion.HedgeHasEdge,
                label: BooleanQuestion.HedgeHasEdge,
                value: 'no',
                typeOfValue: 'boolean',
            },
        ],
        [CalculateHedgeDicepoolCustomIds.Booleans2]: [
            {
                key: BooleanQuestion.ChangelingIncitedBedlam,
                label: BooleanQuestion.ChangelingIncitedBedlam,
                value: 'no',
                typeOfValue: 'boolean',
            },
            {
                key: BooleanQuestion.ChangelingIncitedBedlamWithExceptionalSuccess,
                label: BooleanQuestion.ChangelingIncitedBedlamWithExceptionalSuccess,
                value: 'no',
                typeOfValue: 'boolean',
            },
            {
                key: BooleanQuestion.CharactersInThorns,
                label: BooleanQuestion.CharactersInThorns,
                value: 'no',
                typeOfValue: 'boolean',
            },
        ],
    };

    protected static styleMap = {
        [CalculateHedgeDicepoolCustomIds.TrodRating]: TextInputStyle.Short,
        [CalculateHedgeDicepoolCustomIds.CharactersWithPositiveConditions]: TextInputStyle.Short,
        [CalculateHedgeDicepoolCustomIds.CharactersWithNegativeConditions]: TextInputStyle.Short,
        [CalculateHedgeDicepoolCustomIds.Booleans1]: TextInputStyle.Paragraph,
        [CalculateHedgeDicepoolCustomIds.Booleans2]: TextInputStyle.Paragraph,
    };

    public static getTextInputs(): TextInputBuilder[]
    {
        const trodInput = new TextInputBuilder()
            .setCustomId(CalculateHedgeDicepoolCustomIds.TrodRating)
            .setLabel(NonBooleanLabels.TrodRating)
            .setStyle(this.styleMap[CalculateHedgeDicepoolCustomIds.TrodRating])
            .setMinLength(1)
            .setMaxLength(1)
            .setValue('0')
            .setRequired(true);

        const charactersWithPositiveConditionsInput = new TextInputBuilder()
            .setCustomId(CalculateHedgeDicepoolCustomIds.CharactersWithPositiveConditions)
            .setLabel(NonBooleanLabels.CharactersWithPositiveConditions)
            .setStyle(this.styleMap[CalculateHedgeDicepoolCustomIds.CharactersWithPositiveConditions])
            .setMinLength(1)
            .setMaxLength(1)
            .setValue('0')
            .setRequired(true);

        const charactersWithNegativeConditionsInput = new TextInputBuilder()
            .setCustomId(CalculateHedgeDicepoolCustomIds.CharactersWithNegativeConditions)
            .setLabel(NonBooleanLabels.CharactersWithNegativeConditions)
            .setStyle(this.styleMap[CalculateHedgeDicepoolCustomIds.CharactersWithNegativeConditions])
            .setMinLength(1)
            .setMaxLength(1)
            .setValue('0')
            .setRequired(true);

        const booleansInput1 = new TextInputBuilder()
            .setCustomId(CalculateHedgeDicepoolCustomIds.Booleans1)
            .setLabel(`Booleans 1 (answer each with "Yes" or "No")`)
            .setStyle(this.styleMap[CalculateHedgeDicepoolCustomIds.Booleans1])
            .setMinLength(1)
            .setMaxLength(100)
            .setValue(
                this.getInputValues(CalculateHedgeDicepoolCustomIds.Booleans1),
            )
            .setRequired(true);

        const booleansInput2 = new TextInputBuilder()
            .setCustomId(CalculateHedgeDicepoolCustomIds.Booleans2)
            .setLabel(`Booleans 2 (answer each with "Yes" or "No")`)
            .setStyle(this.styleMap[CalculateHedgeDicepoolCustomIds.Booleans2])
            .setMinLength(1)
            .setMaxLength(100)
            .setValue(
                this.getInputValues(CalculateHedgeDicepoolCustomIds.Booleans2),
            )
            .setRequired(true);

        return [
            trodInput,
            charactersWithPositiveConditionsInput,
            charactersWithNegativeConditionsInput,
            booleansInput1,
            booleansInput2,
        ];
    }

    public static async run(interaction: ModalSubmitInteraction): Promise<void>
    {
        // Parse input
        const { successes } = this.inputData as CalculateHedgeDicepoolModalInputData;
        const {
            [CalculateHedgeDicepoolCustomIds.TrodRating]: trodRating,
            [CalculateHedgeDicepoolCustomIds.CharactersWithPositiveConditions]: charactersWithPositiveConditions,
            [CalculateHedgeDicepoolCustomIds.CharactersWithNegativeConditions]: charactersWithNegativeConditions,
            [CalculateHedgeDicepoolCustomIds.Booleans1]: booleans1,
            [CalculateHedgeDicepoolCustomIds.Booleans2]: booleans2,
        } = this.parseInput<CalculateHedgeDicepoolCustomIds>(interaction);
        const input = this.convertInput({
            trodRating: trodRating as number,
            charactersWithPositiveConditions: charactersWithPositiveConditions as number,
            charactersWithNegativeConditions: charactersWithNegativeConditions as number,
            booleans: {
                ...booleans1 as Record<BooleanQuestion, boolean>,
                ...booleans2 as Record<BooleanQuestion, boolean>,
            },
        });

        // Exit early if there are errors
        if (input.errorMessages.length > 0)
        {
            await interaction.reply({
                content: '```\n' + input.errorMessages.join('\n') + '\n```',
                ephemeral: true,
            });
            return;
        }

        // Get the hedge's dicepool
        const hedgesDicePool = this.calculateHedgesDicepool(input);

        // Update message
        await interaction.deferUpdate();
        const resultMessage = await interaction.followUp({
            content: [
                `You need a total of ${successes} successes to navigate the hedge.`,
                `The hedge's dicepool is ${hedgesDicePool}.`,
            ].join('\n'),
            components: [
                this.getButtonRowComponent(),
            ],
        });

        let numOfTurnsPassed = 0;
        await InteractionStrategy.handleInteractions({
            interactionResponse: resultMessage,
            commandName: `/nwod ${NwodSubcommandGroup.Calculate} ${NwodCalculateSubcommand.HedgeNavigation}`,
            restartStyle: InteractionListenerRestartStyle.OnSuccess,
            onInteraction: async (receivedInteraction) =>
            {
                const handlerMap: Record<TurnUpdateButtonName, () => void> = {
                    [TurnUpdateButtonName.PreviousTurn]: () =>
                    {
                        numOfTurnsPassed -= 1;
                    },
                    [TurnUpdateButtonName.NextTurn]: () =>
                    {
                        numOfTurnsPassed += 1;
                    },
                };
                handlerMap[receivedInteraction.customId as TurnUpdateButtonName]();

                // Update message
                await receivedInteraction.update({
                    content: [
                        `You need a total of ${successes} successes to navigate the hedge.`,
                        `The hedge's dicepool is ${hedgesDicePool + numOfTurnsPassed}.`,
                    ].join('\n'),
                    components: [
                        this.getButtonRowComponent(),
                    ],
                });
            },
            getActionRowComponent: () => this.getButtonRowComponent(),
        });
    }

    private static convertInput({
        trodRating,
        charactersWithPositiveConditions,
        charactersWithNegativeConditions,
        booleans,
    }: {
        trodRating: number;
        charactersWithPositiveConditions: number;
        charactersWithNegativeConditions: number;
        booleans: Record<BooleanQuestion, boolean>;
    }): ParseInputResponse
    {
        const errorMessages: string[] = [];

        // Parse numeric error messages
        if (Number.isNaN(trodRating))
        {
            errorMessages.push(`${CalculateHedgeDicepoolCustomIds.TrodRating} must be an integer`);
        }
        else if (trodRating < 0 || trodRating > 5)
        {
            errorMessages.push(`${CalculateHedgeDicepoolCustomIds.TrodRating} must be between 0-5`);
        }

        if (Number.isNaN(charactersWithPositiveConditions))
        {
            errorMessages.push(`${CalculateHedgeDicepoolCustomIds.CharactersWithPositiveConditions} must be an integer`);
        }
        else if (charactersWithPositiveConditions < 0 || charactersWithPositiveConditions > 9)
        {
            errorMessages.push(`${CalculateHedgeDicepoolCustomIds.CharactersWithPositiveConditions} must be between 0-9`);
        }

        if (Number.isNaN(charactersWithNegativeConditions))
        {
            errorMessages.push(`${CalculateHedgeDicepoolCustomIds.CharactersWithNegativeConditions} must be an integer`);
        }
        else if (charactersWithNegativeConditions < 0 || charactersWithNegativeConditions > 9)
        {
            errorMessages.push(`${CalculateHedgeDicepoolCustomIds.CharactersWithNegativeConditions} must be between 0-9`);
        }

        const booleanQuestionToKey: Record<BooleanQuestion, BooleansKey> = {
            [BooleanQuestion.CharacterHasHalfOrLowerClarity]: 'characterHasHalfOrLowerClarity',
            [BooleanQuestion.CharactersHavePressingTimeLimit]: 'charactersHavePressingTimeLimit',
            [BooleanQuestion.HedgeHasEdge]: 'hedgeHasEdge',
            [BooleanQuestion.ChangelingIncitedBedlam]: 'changelingIncitedBedlam',
            [BooleanQuestion.ChangelingIncitedBedlamWithExceptionalSuccess]: 'changelingIncitedBedlamWithExceptionalSuccess',
            [BooleanQuestion.CharactersInThorns]: 'charactersInThorns',
        };

        // Parse booleans
        const booleansOutput = Object.entries(booleans).reduce<Record<BooleansKey, boolean>>((acc, entry) =>
        {
            const [question, answer] = entry as [BooleanQuestion, boolean];

            // Question does not match any known question
            if (Object.values(BooleanQuestion).find(q => q === question) === undefined)
            {
                errorMessages.push(`The following is not a known question, please do not modify it: ${question}`);
            }

            // Add answer to output
            const key = booleanQuestionToKey[question];
            acc[key] = answer;

            return acc;
        }, {} as Record<BooleansKey, boolean>);

        return {
            trodRating,
            charactersWithPositiveConditions,
            charactersWithNegativeConditions,
            ...booleansOutput,
            errorMessages,
        };
    }

    private static calculateHedgesDicepool({
        trodRating,
        charactersWithPositiveConditions,
        charactersWithNegativeConditions,
        characterHasHalfOrLowerClarity,
        charactersHavePressingTimeLimit,
        hedgeHasEdge,
        changelingIncitedBedlam,
        changelingIncitedBedlamWithExceptionalSuccess,
        charactersInThorns,
    }: ParseInputResponse): number
    {
        // Always start at a base of 5 successes
        const successes = 5;

        // Parse booleans to numeric modifiers
        const characterHasHalfOrLowerClarityModifier = characterHasHalfOrLowerClarity ? 1 : 0;
        const charactersHavePressingTimeLimitModifier = charactersHavePressingTimeLimit ? 2 : 0;
        const hedgeHasEdgeModifier = hedgeHasEdge ? 2 : 0;
        const changelingIncitedBedlamModifier = changelingIncitedBedlam ? 2 : 0;
        const changelingIncitedBedlamWithExceptionalSuccessModifier = changelingIncitedBedlamWithExceptionalSuccess ? 3 : 0;
        const charactersInThornsModifier = charactersInThorns ? 3 : 0;

        // Calculate successes
        return Math.max(0, successes
            - trodRating
            - charactersWithPositiveConditions
            + charactersWithNegativeConditions
            + characterHasHalfOrLowerClarityModifier
            + charactersHavePressingTimeLimitModifier
            + hedgeHasEdgeModifier
            + changelingIncitedBedlamModifier
            + changelingIncitedBedlamWithExceptionalSuccessModifier
            + charactersInThornsModifier);
    }

    private static getButtonRowComponent(): ActionRowBuilder<ButtonBuilder>
    {
        const plusButton = new ButtonBuilder()
            .setCustomId(TurnUpdateButtonName.NextTurn)
            .setLabel('Next Turn')
            .setEmoji('➕')
            .setStyle(ButtonStyle.Secondary);

        const minusButton = new ButtonBuilder()
            .setCustomId(TurnUpdateButtonName.PreviousTurn)
            .setLabel('Previous Turn')
            .setEmoji('➖')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                plusButton,
                minusButton,
            );

        return row;
    }
}
