import type { ButtonInteraction, Message } from 'discord.js';

import { ButtonListenerRestartStyle, ButtonStrategy } from '../../../../src/commands-slash/strategies/ButtonStrategy.js';
import { PaginationButtonName } from '../../../../src/commands-slash/strategies/PaginationStrategy/components/PaginationActionRowBuilder.js';
import { PaginationStrategy } from '../../../../src/commands-slash/strategies/PaginationStrategy/PaginationStrategy.js';
import {
    FakeEmbedBuilder,
    getFakeButtonActionRowBuilder,
    getFakeStringSelectMenuActionRowBuilder,
} from '../../../fakes/discord/builders.js';
import { getFakeMessage } from '../../../fakes/discord/components.js';
import {
    FakeChatInputCommandInteraction,
    FakeStringSelectMenuInteraction,
    getFakeButtonInteraction,
} from '../../../fakes/discord/interactions.js';

describe('class: PaginationStrategy', () =>
{
    let array: string[];
    let pageIndex: number;

    beforeEach(() =>
    {
        pageIndex = 2;
        array = ['0', '1', '2', '3', '4'];
    });

    afterEach(() =>
    {
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });

    describe.each([
        ['ChatInputCommandInteraction', new FakeChatInputCommandInteraction()],
        ['ButtonInteraction', getFakeButtonInteraction()],
        ['StringSelectMenuInteraction', new FakeStringSelectMenuInteraction()],
    ])('interaction: %s', (_, interaction) =>
    {
        describe('method: run', () =>
        {
            const commandName = `/some_command`;
            const interactionType = 'editReply';

            let response: Message<boolean>;

            beforeEach(() =>
            {
                response = getFakeMessage();

                // eslint-disable-next-line @typescript-eslint/no-explicit-any -- This is necessary for mocking the result of the private method
                jest.spyOn(PaginationStrategy as any, 'replyToOriginalInteraction').mockImplementation(() =>
                    response,
                );
            });

            it('should send reply', async () =>
            {
                await PaginationStrategy['run']({
                    originalInteraction: interaction,
                    commandName,
                    interactionType,
                });

                expect(PaginationStrategy['replyToOriginalInteraction']).toHaveBeenCalledWith({
                    originalInteraction: interaction,
                    interactionType,
                    parameters: {
                        content: undefined,
                        components: undefined,
                    },
                });
            });

            it(`should not paginate if there's no embeds or files`, async () =>
            {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any -- This is necessary for mocking the result of the private method
                jest.spyOn(ButtonStrategy as any, 'handleButtonInteractions').mockImplementation(() => undefined);

                await PaginationStrategy['run']({
                    originalInteraction: interaction,
                    commandName,
                    interactionType,
                });

                expect(ButtonStrategy['handleButtonInteractions']).not.toHaveBeenCalled();
            });

            describe.each([
                'embeds',
                'files',
            ] as ('embeds' | 'files')[])('parameter: %s', (parameterName) =>
            {
                it('should paginate if provided', async () =>
                {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- This is necessary for mocking the result of the private method
                    const spyOnHandleButtonInteractions = jest.spyOn(ButtonStrategy as any, 'handleButtonInteractions').mockImplementation(() => undefined);

                    await PaginationStrategy['run']({
                        originalInteraction: interaction,
                        commandName,
                        interactionType,
                        [parameterName]: array,
                    });

                    expect(spyOnHandleButtonInteractions).toHaveBeenCalledWith(
                        expect.objectContaining({
                            interactionResponse: response,
                            commandName,
                            restartStyle: ButtonListenerRestartStyle.OnSuccess,
                        }),
                    );
                });

                it(`should include rowsAbovePagination and ${parameterName} if provided`, async () =>
                {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- This is necessary for mocking the result of the private method
                    jest.spyOn(ButtonStrategy as any, 'handleButtonInteractions').mockImplementation(() => undefined);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- This is necessary for mocking the result of the private method
                    const spyOnReplyToOriginalInteraction = jest.spyOn(PaginationStrategy as any, 'replyToOriginalInteraction');

                    const rowsAbovePagination = [
                        getFakeStringSelectMenuActionRowBuilder({ customId: 'first' }),
                    ];

                    const buttonActionRowBuilder = getFakeButtonActionRowBuilder({ customId: 'fake-button-1' });

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- This is necessary for mocking the result of private methods
                    jest.spyOn(PaginationStrategy as any, 'getComponents').mockReturnValue([
                        ...rowsAbovePagination,
                        buttonActionRowBuilder,
                    ]);

                    await PaginationStrategy['run']({
                        originalInteraction: interaction,
                        commandName,
                        interactionType,
                        [parameterName]: array,
                        rowsAbovePagination: [
                            rowsAbovePagination[0],
                        ],
                    });

                    expect(spyOnReplyToOriginalInteraction).toHaveBeenCalledWith({
                        originalInteraction: interaction,
                        interactionType,
                        parameters: {
                            content: undefined,
                            [parameterName]: [array[0]],
                            components: [
                                ...rowsAbovePagination,
                                buttonActionRowBuilder,
                            ],
                        },
                    });
                });
            });

            it('should include rowsAbovePagination if provided, and embeds and files are not provided', async () =>
            {
                const components = [
                    getFakeStringSelectMenuActionRowBuilder({ customId: 'first' }),
                ];

                await PaginationStrategy['run']({
                    originalInteraction: interaction,
                    commandName,
                    interactionType,
                    rowsAbovePagination: [
                        components[0],
                    ],
                });

                expect(PaginationStrategy['replyToOriginalInteraction']).toHaveBeenCalledWith(
                    expect.objectContaining({
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- We want this to test only one parameter
                        parameters: expect.objectContaining({
                            components,
                        }),
                    }),
                );
            });
        });

        describe('method: onButtonPress', () =>
        {
            let buttonInteraction: ButtonInteraction;
            let response: Message;

            beforeEach(() =>
            {
                buttonInteraction = getFakeButtonInteraction();
                response = getFakeMessage();
            });

            it('should delete message if delete button is clicked by a user that did start the interaction', async () =>
            {
                const responseDeleteSpy = jest.spyOn(response, 'delete');
                // eslint-disable-next-line @typescript-eslint/no-explicit-any -- This is necessary for mocking the result of private methods
                jest.spyOn(PaginationStrategy as any, 'updatePageIndex').mockReturnValue({
                    newPageIndex: 0,
                    deleteMessage: true,
                    isNonPaginationButtonPress: false,
                });

                // The user that did start the interaction
                buttonInteraction.user.id = interaction.user.id;

                await PaginationStrategy['onButtonPress']({
                    originalInteraction: interaction,
                    buttonInteraction,
                    response,
                    content: '',
                    embeds: [],
                    files: [],
                    pageIndex,
                    includeDeleteButton: true,
                    validRowsAbovePagination: [],
                    onRowAbovePaginationButtonPress: undefined,
                });

                expect(responseDeleteSpy).toHaveBeenCalled();
            });

            it('should not delete message if delete button is clicked by a user that did not start the interaction', async () =>
            {
                const responseDeleteSpy = jest.spyOn(response, 'delete');
                // eslint-disable-next-line @typescript-eslint/no-explicit-any -- This is necessary for mocking the result of private methods
                jest.spyOn(PaginationStrategy as any, 'updatePageIndex').mockReturnValue({
                    newPageIndex: 0,
                    deleteMessage: true,
                    isNonPaginationButtonPress: false,
                });

                // The user that did not start the interaction
                buttonInteraction.user.id = `${interaction.user.id}-1`;

                await PaginationStrategy['onButtonPress']({
                    originalInteraction: interaction,
                    buttonInteraction,
                    response,
                    content: '',
                    embeds: [],
                    files: [],
                    pageIndex,
                    includeDeleteButton: true,
                    validRowsAbovePagination: [],
                    onRowAbovePaginationButtonPress: undefined,
                });

                expect(responseDeleteSpy).not.toHaveBeenCalled();
            });

            it('should call onRowAbovePaginationButtonPress callback if provided and non-pagination button is pressed', async () =>
            {
                const onRowAbovePaginationButtonPress = jest.fn().mockReturnValue({});
                // eslint-disable-next-line @typescript-eslint/no-explicit-any -- This is necessary for mocking the result of private methods
                jest.spyOn(PaginationStrategy as any, 'updatePageIndex').mockReturnValue({
                    newPageIndex: 0,
                    deleteMessage: false,
                    isNonPaginationButtonPress: true,
                });

                await PaginationStrategy['onButtonPress']({
                    originalInteraction: interaction,
                    buttonInteraction,
                    response,
                    content: '',
                    embeds: [],
                    files: [],
                    pageIndex,
                    includeDeleteButton: true,
                    validRowsAbovePagination: [],
                    onRowAbovePaginationButtonPress,
                });

                expect(onRowAbovePaginationButtonPress).toHaveBeenCalled();
            });

            it('should not call onRowAbovePaginationButtonPress callback if provided and non-pagination button is not pressed', async () =>
            {
                const onRowAbovePaginationButtonPress = jest.fn().mockReturnValue({});
                // eslint-disable-next-line @typescript-eslint/no-explicit-any -- This is necessary for mocking the result of private methods
                jest.spyOn(PaginationStrategy as any, 'updatePageIndex').mockReturnValue({
                    newPageIndex: 0,
                    deleteMessage: false,
                    isNonPaginationButtonPress: false,
                });

                await PaginationStrategy['onButtonPress']({
                    originalInteraction: interaction,
                    buttonInteraction,
                    response,
                    content: '',
                    embeds: [],
                    files: [],
                    pageIndex,
                    includeDeleteButton: true,
                    validRowsAbovePagination: [],
                    onRowAbovePaginationButtonPress,
                });

                expect(onRowAbovePaginationButtonPress).not.toHaveBeenCalled();
            });

            it('should call onRowAbovePaginationButtonPress callback with embeds/files if provided', async () =>
            {
                const onRowAbovePaginationButtonPress = jest.fn().mockReturnValue({});
                // eslint-disable-next-line @typescript-eslint/no-explicit-any -- This is necessary for mocking the result of private methods
                jest.spyOn(PaginationStrategy as any, 'updatePageIndex').mockReturnValue({
                    newPageIndex: 0,
                    deleteMessage: false,
                    isNonPaginationButtonPress: true,
                });

                const embeds = [new FakeEmbedBuilder()];
                const files = [{ attachment: 'fake-attachment-1' }];

                await PaginationStrategy['onButtonPress']({
                    originalInteraction: interaction,
                    buttonInteraction,
                    response,
                    content: '',
                    embeds,
                    files,
                    pageIndex,
                    includeDeleteButton: true,
                    validRowsAbovePagination: [],
                    onRowAbovePaginationButtonPress,
                });

                expect(onRowAbovePaginationButtonPress).toHaveBeenCalledWith(buttonInteraction, {
                    embeds,
                    files,
                });
            });

            it('should call onRowAbovePaginationButtonPress callback without embeds/files if not provided', async () =>
            {
                const onRowAbovePaginationButtonPress = jest.fn().mockReturnValue({});
                // eslint-disable-next-line @typescript-eslint/no-explicit-any -- This is necessary for mocking the result of private methods
                jest.spyOn(PaginationStrategy as any, 'updatePageIndex').mockReturnValue({
                    newPageIndex: 0,
                    deleteMessage: false,
                    isNonPaginationButtonPress: true,
                });

                await PaginationStrategy['onButtonPress']({
                    originalInteraction: interaction,
                    buttonInteraction,
                    response,
                    content: '',
                    embeds: undefined,
                    files: undefined,
                    pageIndex,
                    includeDeleteButton: true,
                    validRowsAbovePagination: [],
                    onRowAbovePaginationButtonPress,
                });

                expect(onRowAbovePaginationButtonPress).toHaveBeenCalledWith(buttonInteraction, {});
            });

            it('should include embeds & files from onRowAbovePaginationButtonPress callback in output if defined', async () =>
            {
                const embeds = [new FakeEmbedBuilder()];
                const files = [{ attachment: 'fake-attachment-1' }];

                const onRowAbovePaginationButtonPress = jest.fn().mockReturnValue({
                    embeds,
                    files,
                });
                // eslint-disable-next-line @typescript-eslint/no-explicit-any -- This is necessary for mocking the result of private methods
                jest.spyOn(PaginationStrategy as any, 'updatePageIndex').mockReturnValue({
                    newPageIndex: 0,
                    deleteMessage: false,
                    isNonPaginationButtonPress: true,
                });

                const output = await PaginationStrategy['onButtonPress']({
                    originalInteraction: interaction,
                    buttonInteraction,
                    response,
                    content: '',
                    embeds,
                    files,
                    pageIndex,
                    includeDeleteButton: true,
                    validRowsAbovePagination: [],
                    onRowAbovePaginationButtonPress,
                });

                expect(output?.embeds).toEqual(embeds);
                expect(output?.files).toEqual(files);
            });

            it('should not include embeds & files from onRowAbovePaginationButtonPress callback in output if undefined', async () =>
            {
                const onRowAbovePaginationButtonPress = jest.fn().mockReturnValue({});
                // eslint-disable-next-line @typescript-eslint/no-explicit-any -- This is necessary for mocking the result of private methods
                jest.spyOn(PaginationStrategy as any, 'updatePageIndex').mockReturnValue({
                    newPageIndex: 0,
                    deleteMessage: false,
                    isNonPaginationButtonPress: true,
                });

                const output = await PaginationStrategy['onButtonPress']({
                    originalInteraction: interaction,
                    buttonInteraction,
                    response,
                    content: '',
                    embeds: [],
                    files: [],
                    pageIndex,
                    includeDeleteButton: true,
                    validRowsAbovePagination: [],
                    onRowAbovePaginationButtonPress,
                });

                expect(output?.embeds).toEqual(undefined);
                expect(output?.files).toEqual(undefined);
            });

            it('should update button interaction with new page index and components', async () =>
            {
                const componentsOutput = getFakeButtonActionRowBuilder({ customId: 'fake-button-1' });

                const buttonInteractionUpdateSpy = jest.spyOn(buttonInteraction, 'update');
                // eslint-disable-next-line @typescript-eslint/no-explicit-any -- This is necessary for mocking the result of private methods
                jest.spyOn(PaginationStrategy as any, 'updatePageIndex').mockReturnValue({
                    newPageIndex: 0,
                    deleteMessage: false,
                    isNonPaginationButtonPress: false,
                });
                // eslint-disable-next-line @typescript-eslint/no-explicit-any -- This is necessary for mocking the result of private methods
                jest.spyOn(PaginationStrategy as any, 'getComponents').mockReturnValue(
                    componentsOutput,
                );

                const embeds = [
                    new FakeEmbedBuilder({ color: 1 }),
                    new FakeEmbedBuilder({ color: 2 }),
                ];
                const files = [
                    { attachment: 'fake-attachment-1' },
                    { attachment: 'fake-attachment-2' },
                ];

                await PaginationStrategy['onButtonPress']({
                    originalInteraction: interaction,
                    buttonInteraction,
                    response,
                    content: '',
                    embeds,
                    files,
                    pageIndex,
                    includeDeleteButton: true,
                    validRowsAbovePagination: [],
                });

                expect(buttonInteractionUpdateSpy).toHaveBeenCalledWith({
                    components: componentsOutput,
                    content: '',
                    embeds: [embeds[0]],
                    files: [files[0]],
                });
            });
        });
    });

    describe('method: updatePageIndex', () =>
    {
        describe.each([
            [PaginationButtonName.Previous, {
                newPageIndex: 1,
                deleteMessage: false,
                isNonPaginationButtonPress: false,
            }],
            [PaginationButtonName.Next, {
                newPageIndex: 3,
                deleteMessage: false,
                isNonPaginationButtonPress: false,
            }],
            [PaginationButtonName.First, {
                newPageIndex: 0,
                deleteMessage: false,
                isNonPaginationButtonPress: false,
            }],
            [PaginationButtonName.Last, {
                newPageIndex: 4,
                deleteMessage: false,
                isNonPaginationButtonPress: false,
            }],
            [PaginationButtonName.Delete, {
                newPageIndex: 2,
                deleteMessage: true,
                isNonPaginationButtonPress: false,
            }],
        ])('button: %s', (customId, validExpectedResult) =>
        {
            describe.each([
                ['embeds'],
                ['files'],
            ] as [('embeds' | 'files')][])('parameter: %s', (parameterName) =>
            {
                it(`should return correct index for page`, () =>
                {
                    const result = PaginationStrategy['updatePageIndex']({
                        buttonInteraction: getFakeButtonInteraction(customId),
                        pageIndex,
                        [parameterName]: array,
                    });

                    expect(result).toEqual(validExpectedResult);
                });

                it.each([
                    ['has 0 elements', []],
                    ['has 1 element', ['']],
                ])('should always return an index of 0 if the array %s', (_, inputArray) =>
                {
                    const result = PaginationStrategy['updatePageIndex']({
                        buttonInteraction: getFakeButtonInteraction(customId),
                        pageIndex: 0,
                        [parameterName]: inputArray,
                    });

                    expect(result).toEqual({
                        ...validExpectedResult,
                        newPageIndex: 0,
                    });
                });

                it('should always return an index of 0 if no array is provided', () =>
                {
                    const result = PaginationStrategy['updatePageIndex']({
                        buttonInteraction: getFakeButtonInteraction(customId),
                        pageIndex: 0,
                    });

                    expect(result).toEqual({
                        ...validExpectedResult,
                        newPageIndex: 0,
                    });
                });
            });

            it('should always return an index of 0 if no array is provided', () =>
            {
                const result = PaginationStrategy['updatePageIndex']({
                    buttonInteraction: getFakeButtonInteraction(customId),
                    pageIndex: 0,
                });

                expect(result).toEqual({
                    ...validExpectedResult,
                    newPageIndex: 0,
                });
            });
        });

        it('should return isNonPaginationButtonPress as true if customId is not a pagination button', () =>
        {
            const result = PaginationStrategy['updatePageIndex']({
                buttonInteraction: getFakeButtonInteraction('fake-custom-id'),
                pageIndex,
            });

            expect(result).toEqual({
                newPageIndex: pageIndex,
                deleteMessage: false,
                isNonPaginationButtonPress: true,
            });
        });
    });
});
