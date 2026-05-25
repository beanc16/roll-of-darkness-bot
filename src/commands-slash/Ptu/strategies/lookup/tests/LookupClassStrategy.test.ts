/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
// ^ the above are giving a lot of false negatives for some reason, temporarily disabling

import { FakeEmbedBuilder } from '../../../../../fakes/discord/builders';
import { FakeChatInputCommandInteraction } from '../../../../../fakes/discord/interactions';
import { chunkArray } from '../../../../../services/chunkArray/chunkArray';
import { PaginationStrategy } from '../../../../strategies/PaginationStrategy/PaginationStrategy';
import { PtuSubcommandGroup } from '../../../options';
import { PtuLookupSubcommand } from '../../../options/lookup';
import { PtuFeature } from '../../../types/PtuFeature';
import { LookupClassStrategy, PtuClassName } from '../LookupClassStrategy';
import { LookupFeatureStrategy } from '../LookupFeatureStrategy';

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
                describe(`${classNames.join(', ')}`, () =>
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

                    it('should not throw error', () =>
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

    describe('method: getLookupData', () =>
    {
        let getLookupDataSpy: jest.SpyInstance;

        beforeEach(() =>
        {
            getLookupDataSpy = jest.spyOn(LookupFeatureStrategy, 'getLookupData');
        });

        afterEach(() =>
        {
            jest.restoreAllMocks();
        });

        describe('autocomplete path', () =>
        {
            const mockFeatures = [
                new PtuFeature(['Perseverance']),
                new PtuFeature(['Elite Trainer']),
            ];

            const expectedSyntheticNames = Object.values(PtuClassName).filter(name =>
                (name.includes('Researcher') && name !== PtuClassName.Researcher)
                || name.includes('Elementalist'),
            );

            beforeEach(() =>
            {
                getLookupDataSpy.mockResolvedValue(mockFeatures);
            });

            describe.each([
                { label: 'names is undefined', lookupInput: { names: undefined as unknown as PtuClassName[] } },
                { label: 'names is empty', lookupInput: { names: [] } },
            ])('$label', ({ lookupInput }) =>
            {
                it('should call LookupFeatureStrategy.getLookupData with all class names and sortByName true', async () =>
                {
                    await LookupClassStrategy.getLookupData(lookupInput);

                    expect(getLookupDataSpy).toHaveBeenCalledWith({
                        names: Object.values(PtuClassName),
                        sortByName: true,
                    });
                });

                it('should return a single outer array containing mock features followed by synthetic entries', async () =>
                {
                    const result = await LookupClassStrategy.getLookupData(lookupInput);

                    expect(result).toHaveLength(1);
                    expect(result[0].map(f => f.name)).toEqual([
                        ...mockFeatures.map(f => f.name),
                        ...expectedSyntheticNames,
                    ]);
                });
            });
        });

        describe('normal lookup path', () =>
        {
            describe('single class', () =>
            {
                const featureNames = [
                    PtuClassName.AceTrainer,
                    'Perseverance',
                    'Elite Trainer',
                    'Critical Moment',
                    'Top Percentage',
                    'Signature Technique',
                    'Champ in the Making',
                ];
                const mockFeatures = featureNames.map(name => new PtuFeature([name]));

                beforeEach(() =>
                {
                    getLookupDataSpy.mockResolvedValue(mockFeatures);
                });

                it('should call LookupFeatureStrategy.getLookupData with correct parameters', async () =>
                {
                    await LookupClassStrategy.getLookupData({
                        names: [PtuClassName.AceTrainer],
                        includeAllIfNoName: false,
                    });

                    expect(getLookupDataSpy).toHaveBeenCalledWith({
                        names: featureNames,
                        sortByName: false,
                        includeAllIfNoName: false,
                    });
                });

                it('should return all features in a single subarray', async () =>
                {
                    const result = await LookupClassStrategy.getLookupData({
                        names: [PtuClassName.AceTrainer],
                        includeAllIfNoName: false,
                    });

                    expect(result).toHaveLength(1);
                    expect(result[0].map(f => f.name)).toEqual(featureNames);
                });
            });

            describe('multiple classes', () =>
            {
                const aceTrainerFeatureNames = [
                    PtuClassName.AceTrainer,
                    'Perseverance',
                    'Elite Trainer',
                    'Critical Moment',
                    'Top Percentage',
                    'Signature Technique',
                    'Champ in the Making',
                ];
                const commanderFeatureNames = [
                    PtuClassName.Commander,
                    'Mobilize',
                    'Leadership',
                    'Battle Conductor',
                    'Complex Orders',
                    'Tip the Scales',
                    'Scheme Twist',
                ];
                const mockFeatures = [...aceTrainerFeatureNames, ...commanderFeatureNames].map(
                    name => new PtuFeature([name]),
                );

                beforeEach(() =>
                {
                    getLookupDataSpy.mockResolvedValue(mockFeatures);
                });

                it('should call LookupFeatureStrategy.getLookupData with all feature names combined', async () =>
                {
                    await LookupClassStrategy.getLookupData({
                        names: [PtuClassName.AceTrainer, PtuClassName.Commander],
                        includeAllIfNoName: false,
                    });

                    expect(getLookupDataSpy).toHaveBeenCalledWith({
                        names: [...aceTrainerFeatureNames, ...commanderFeatureNames],
                        sortByName: false,
                        includeAllIfNoName: false,
                    });
                });

                it('should return features split into a separate subarray per class', async () =>
                {
                    const result = await LookupClassStrategy.getLookupData({
                        names: [PtuClassName.AceTrainer, PtuClassName.Commander],
                        includeAllIfNoName: false,
                    });

                    expect(result).toHaveLength(2);
                    expect(result[0].map(f => f.name)).toEqual(aceTrainerFeatureNames);
                    expect(result[1].map(f => f.name)).toEqual(commanderFeatureNames);
                });
            });

            describe('elementalist class', () =>
            {
                const featureNames = [
                    'Swarmlord',
                    'How To Shoot Web',
                    'Broodlord',
                    'Pheromone Markers',
                    'Enhanced Embrace Rank 1',
                    'Enhanced Embrace Rank 2',
                    'Enhanced Embrace Rank 3',
                ];
                const mockFeatures = featureNames.map(name => new PtuFeature([name]));

                beforeEach(() =>
                {
                    getLookupDataSpy.mockResolvedValue(mockFeatures);
                });

                it('should convert the elementalist class name to its feature name before calling LookupFeatureStrategy.getLookupData', async () =>
                {
                    await LookupClassStrategy.getLookupData({
                        names: [PtuClassName.BugElementalist],
                        includeAllIfNoName: false,
                    });

                    expect(getLookupDataSpy).toHaveBeenCalledWith({
                        names: featureNames,
                        sortByName: false,
                        includeAllIfNoName: false,
                    });
                });

                it('should return all features in a single subarray', async () =>
                {
                    const result = await LookupClassStrategy.getLookupData({
                        names: [PtuClassName.BugElementalist],
                        includeAllIfNoName: false,
                    });

                    expect(result).toHaveLength(1);
                    expect(result[0].map(f => f.name)).toEqual(featureNames);
                });
            });

            describe('features missing from getLookupData results', () =>
            {
                it('should exclude missing features from the result', async () =>
                {
                    getLookupDataSpy.mockResolvedValue([new PtuFeature([PtuClassName.AceTrainer])]);

                    const result = await LookupClassStrategy.getLookupData({
                        names: [PtuClassName.AceTrainer],
                        includeAllIfNoName: false,
                    });

                    expect(result).toHaveLength(1);
                    expect(result[0].map(f => f.name)).toEqual([PtuClassName.AceTrainer]);
                });

                it('should return an empty array if no features are returned', async () =>
                {
                    getLookupDataSpy.mockResolvedValue([]);

                    const result = await LookupClassStrategy.getLookupData({
                        names: [PtuClassName.AceTrainer],
                        includeAllIfNoName: false,
                    });

                    expect(result).toEqual([]);
                });
            });
        });
    });
});
