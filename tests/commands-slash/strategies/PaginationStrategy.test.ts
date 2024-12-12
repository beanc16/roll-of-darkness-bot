import type { Message } from 'discord.js';

import { PaginationButtonName, PaginationStrategy } from '../../../src/commands-slash/strategies/PaginationStrategy.js';
import { getFakeStringSelectMenuActionRowBuilder } from '../../fakes/discord/builders.js';
import { getFakeMessage } from '../../fakes/discord/components.js';
import {
    FakeChatInputCommandInteraction,
    FakeStringSelectMenuInteraction,
    getFakeButtonInteraction,
} from '../../fakes/discord/interactions.js';

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
        jest.clearAllMocks();
    });

    describe('method: run', () =>
    {
        const interactionType = 'editReply';

        describe.each([
            ['ChatInputCommandInteraction', new FakeChatInputCommandInteraction()],
            ['ButtonInteraction', getFakeButtonInteraction()],
            ['StringSelectMenuInteraction', new FakeStringSelectMenuInteraction()],
        ])('interaction: %s', (_, interaction) =>
        {
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
                    interactionType,
                });

                expect(PaginationStrategy['replyToOriginalInteraction']).toHaveBeenCalledWith({
                    originalInteraction: interaction,
                    interactionType,
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- We want this to test only one parameter
                    parameters: expect.objectContaining({
                        components: [],
                    }),
                });
            });

            it(`should not paginate if there's no embeds or files`, async () =>
            {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any -- This is necessary for mocking the result of the private method
                jest.spyOn(PaginationStrategy as any, 'sendPagedMessages').mockImplementation(() => undefined);

                await PaginationStrategy['run']({
                    originalInteraction: interaction,
                    interactionType,
                });

                expect(PaginationStrategy['sendPagedMessages']).not.toHaveBeenCalled();
            });

            describe.each([
                ['embeds', 'files'],
                ['files', 'embeds'],
            ] as [('embeds' | 'files'), ('embeds' | 'files')][])('parameter: %s', (parameterName, otherParameterName) =>
            {
                it('should paginate if provided', async () =>
                {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- This is necessary for mocking the result of the private method
                    jest.spyOn(PaginationStrategy as any, 'sendPagedMessages').mockImplementation(() => undefined);

                    await PaginationStrategy['run']({
                        originalInteraction: interaction,
                        interactionType,
                        [parameterName]: array,
                    });

                    expect(PaginationStrategy['sendPagedMessages']).toHaveBeenCalledWith({
                        originalInteraction: interaction,
                        [parameterName]: array,
                        [otherParameterName]: undefined,
                        interactionResponse: response,
                        pageIndex: 0,
                    });
                });

                it(`should include rowsAbovePagination and ${parameterName} if provided`, async () =>
                {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- This is necessary for mocking the result of the private method
                    jest.spyOn(PaginationStrategy as any, 'sendPagedMessages').mockImplementation(() =>
                        response,
                    );

                    const components = [
                        getFakeStringSelectMenuActionRowBuilder({ customId: 'first' }),
                    ];

                    await PaginationStrategy['run']({
                        originalInteraction: interaction,
                        interactionType,
                        [parameterName]: array,
                        rowsAbovePagination: [
                            components[0],
                        ],
                    });

                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any -- We want this to test only one parameter
                    const replyToOriginalInteractionFirstCallArguments = (PaginationStrategy['replyToOriginalInteraction'] as any).mock.calls[0][0];

                    expect(
                        // Must JSON.stringify because the objects
                        // are not completely equal, since one is
                        // real and one is a jest mock

                        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- We want this to test only one parameter
                        JSON.stringify(replyToOriginalInteractionFirstCallArguments.parameters),
                    ).toEqual(
                        JSON.stringify({
                            [parameterName]: [array[0]],
                            components: [
                                components[0],
                                getFakeStringSelectMenuActionRowBuilder({ customId: array[0] }),
                            ],
                        }),
                    );
                });
            });

            it('should include rowsAbovePagination if provided, and embeds and files are not provided', async () =>
            {
                const components = [
                    getFakeStringSelectMenuActionRowBuilder({ customId: 'first' }),
                ];

                await PaginationStrategy['run']({
                    originalInteraction: interaction,
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
    });

    describe('method: updatePageIndex', () =>
    {
        describe.each([
            [PaginationButtonName.Previous, 1],
            [PaginationButtonName.Next, 3],
            [PaginationButtonName.First, 0],
            [PaginationButtonName.Last, 4],
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

                    expect(result).toEqual(0);
                });

                it('should always return an index of 0 if no array is provided', () =>
                {
                    const result = PaginationStrategy['updatePageIndex']({
                        buttonInteraction: getFakeButtonInteraction(customId),
                        pageIndex: 0,
                    });

                    expect(result).toEqual(0);
                });
            });

            it('should always return an index of 0 if no array is provided', () =>
            {
                const result = PaginationStrategy['updatePageIndex']({
                    buttonInteraction: getFakeButtonInteraction(customId),
                    pageIndex: 0,
                });

                expect(result).toEqual(0);
            });
        });
    });
});
