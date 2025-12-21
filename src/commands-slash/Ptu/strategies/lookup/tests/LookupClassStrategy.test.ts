import { FakeEmbedBuilder } from '../../../../../fakes/discord/builders';
import { FakeChatInputCommandInteraction } from '../../../../../fakes/discord/interactions';
import { chunkArray } from '../../../../../services/chunkArray/chunkArray';
import { PaginationStrategy } from '../../../../strategies/PaginationStrategy/PaginationStrategy';
import { PtuSubcommandGroup } from '../../../options';
import { PtuLookupSubcommand } from '../../../options/lookup';
import { LookupClassStrategy, PtuClassName } from '../LookupClassStrategy';

// We don't want to log anything during these tests that would normally log
jest.mock('@beanc16/logger');

// This mock is necessary to prevent an ESM export error with @swc/jest
jest.mock('@beanc16/microservices-abstraction', () =>
{
    return {
        GoogleSheetsMicroservice: jest.fn(),
        GoogleSheetsMicroserviceFilterType: {
            CaseInsensitiveExcludes: 'case_insensitive_excludes',
        },
        UserMicroservice: {
            v1: {
                getServiceToServiceAuthToken: jest.fn().mockImplementation(() =>
                {
                    return {
                        data: {
                            token: 'token',
                        },
                    };
                }),
            },
        },
    };
});

// This throws an error if not mocked
jest.mock('@beanc16/discordjs-helpers');

jest.mock('../../../../strategies/PaginationStrategy/PaginationStrategy.js', () =>
{
    return {
        PaginationStrategy: {
            run: jest.fn(),
        },
    };
});

describe('class: LookupClassStrategy', () =>
{
    const input = new FakeChatInputCommandInteraction();

    function getExpectedParameters(embeds: FakeEmbedBuilder[], index: number): {
        originalInteraction: FakeChatInputCommandInteraction;
        commandName: string;
        embeds: FakeEmbedBuilder[];
        interactionType: 'editReply' | 'followUp';
        includeDeleteButton: boolean;
    }
    {
        return {
            originalInteraction: input,
            commandName: `/ptu ${PtuSubcommandGroup.Lookup} ${PtuLookupSubcommand.Class}`,
            embeds,
            interactionType: index === 0 ? 'editReply' : 'followUp',
            includeDeleteButton: true,
        };
    }

    describe('method: run', () =>
    {
        describe.each([1, 2, 3, 4])('%s Class(es) at a Time', (numOfClasses) =>
        {
            const chunkedClasses = chunkArray({
                array: Object.values(PtuClassName),
                shouldMoveToNextChunk: (_1, _2, curChunk) => curChunk.length >= numOfClasses,
            });

            chunkedClasses.forEach((classNames) =>
            {
                describe(classNames.join(', '), () =>
                {
                    beforeEach(() =>
                    {
                        classNames.forEach((className) =>
                        {
                            // class_name_1 through class_name_4
                            jest.spyOn(input.options, 'getString').mockReturnValue(className);
                        });

                        jest.clearAllMocks();
                    });

                    it('should not throw error', async () =>
                    {
                        expect(async () =>
                        {
                            await LookupClassStrategy.run(input);
                        }).not.toThrow();
                    });

                    it('should call PaginationStrategy with the correct parameters', async () =>
                    {
                        // Arrange
                        const embeds = [
                            [new FakeEmbedBuilder(), new FakeEmbedBuilder()],
                            [new FakeEmbedBuilder()],
                        ];
                        jest.spyOn(LookupClassStrategy, 'getEmbedMessages').mockReturnValue(embeds);

                        // Act
                        const result = await LookupClassStrategy.run(input);

                        // Assert
                        embeds.forEach((curEmbeds, index) =>
                        {
                            // eslint-disable-next-line @typescript-eslint/unbound-method
                            expect(PaginationStrategy.run).toHaveBeenNthCalledWith(
                                index + 1,
                                getExpectedParameters(curEmbeds, index),
                            );
                        });
                        expect(result).toEqual(true);
                    });
                });
            });
        });
    });
});
