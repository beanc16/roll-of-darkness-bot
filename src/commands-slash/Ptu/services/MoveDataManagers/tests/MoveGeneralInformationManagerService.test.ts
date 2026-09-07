import { faker } from '@faker-js/faker';
import { MongoDbResults } from 'mongodb-controller';

import {
    PtuCustomMoveArmorClass,
    PtuCustomMoveDamageBase,
    PtuCustomMoveFrequency,
    PtuMoveStatus,
} from '../../../dal/models/PtuMoveCollection.js';
import { PtuMoveController } from '../../../dal/PtuMoveController.js';
import { PtuMovePseudoCache } from '../../../dal/PtuMovePseudoCache.js';
import { getRandomKeywords } from '../../../fakes/ptu.fakes.js';
import { createPtuMoveCollectionData } from '../../../fakes/PtuMoveCollection.fakes.js';
import { LookupKeywordStrategy } from '../../../strategies/lookup/LookupKeywordStrategy.js';
import { LookupMoveStrategy } from '../../../strategies/lookup/LookupMoveStrategy.js';
import {
    PokemonMoveCategory,
    PokemonType,
    PtuContestStatEffect,
    PtuContestStatType,
} from '../../../types/pokemon.js';
import { PtuKeywordType } from '../../../types/PtuKeyword.js';
import { MoveGeneralInformationManagerService } from '../MoveGeneralInformationManagerService.js';

jest.mock('../../../dal/PtuMoveController', () =>
{
    return {
        PtuMoveController: {
            findOneAndUpdate: jest.fn(),
            aggregate: jest.fn(),
        },
    };
});

jest.mock('../../../dal/PtuMovePseudoCache', () =>
{
    return {
        PtuMovePseudoCache: {
            update: jest.fn(),
        },
    };
});

jest.mock('../../../strategies/lookup/LookupKeywordStrategy', () =>
{
    return {
        LookupKeywordStrategy: {
            getLookupData: jest.fn(),
        },
    };
});

jest.mock('../../../strategies/lookup/LookupMoveStrategy', () =>
{
    return {
        LookupMoveStrategy: {
            getLookupData: jest.fn(),
        },
    };
});

describe(`class: ${MoveGeneralInformationManagerService.name}`, () =>
{
    let userId: string;

    beforeEach(() =>
    {
        jest.clearAllMocks();

        userId = 'userId';
    });

    describe(`method: ${MoveGeneralInformationManagerService.updateName.name}`, () =>
    {
        it('should update move name', async () =>
        {
            // Arrange
            const move = createPtuMoveCollectionData();
            const name = 'New Move Name';
            const expectedResult = createPtuMoveCollectionData();
            const updateSpy = jest.spyOn(PtuMovePseudoCache, 'update')
                .mockResolvedValue(expectedResult);

            // Act
            const result = await MoveGeneralInformationManagerService.updateName({
                userId,
                move,
                name,
            });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(updateSpy).toHaveBeenCalledTimes(1);
            expect(updateSpy).toHaveBeenCalledWith(
                { id: move.id },
                { name },
                userId,
            );
        });

        it('should throw an error if name is empty', async () =>
        {
            // Arrange
            const move = createPtuMoveCollectionData();
            const name = '';
            const updateSpy = jest.spyOn(PtuMovePseudoCache, 'update');

            // Act & Assert
            await expect(
                MoveGeneralInformationManagerService.updateName({
                    userId,
                    move,
                    name,
                }),
            ).rejects.toThrow('Move name cannot be empty');
            expect(updateSpy).not.toHaveBeenCalled();
        });

        it('should throw an error if name is only whitespace', async () =>
        {
            // Arrange
            const move = createPtuMoveCollectionData();
            const name = '   ';
            const updateSpy = jest.spyOn(PtuMovePseudoCache, 'update');

            // Act & Assert
            await expect(
                MoveGeneralInformationManagerService.updateName({
                    userId,
                    move,
                    name,
                }),
            ).rejects.toThrow('Move name cannot be empty');
            expect(updateSpy).not.toHaveBeenCalled();
        });
    });

    describe(`method: ${MoveGeneralInformationManagerService.updateStatus.name}`, () =>
    {
        it('should update status using PtuMovePseudoCache when userId is provided', async () =>
        {
            // Arrange
            const move = createPtuMoveCollectionData();
            const status = PtuMoveStatus.READY_FOR_REVIEW;
            const expectedResult = createPtuMoveCollectionData();
            const updateSpy = jest.spyOn(PtuMovePseudoCache, 'update')
                .mockResolvedValue(expectedResult);
            const findOneAndUpdateSpy = jest.spyOn(PtuMoveController, 'findOneAndUpdate');

            // Act
            const result = await MoveGeneralInformationManagerService.updateStatus({
                userId,
                move,
                status,
            });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(updateSpy).toHaveBeenCalledTimes(1);
            expect(updateSpy).toHaveBeenCalledWith(
                { id: move.id },
                { status },
                userId,
            );
            expect(findOneAndUpdateSpy).not.toHaveBeenCalled();
        });

        it('should update status using PtuMoveController when userId is not provided', async () =>
        {
            // Arrange
            const move = createPtuMoveCollectionData();
            const status = PtuMoveStatus.PASSED_REVIEW;
            const expectedResult = createPtuMoveCollectionData();
            const updateSpy = jest.spyOn(PtuMovePseudoCache, 'update');
            const findOneAndUpdateSpy = jest.spyOn(PtuMoveController, 'findOneAndUpdate')
                .mockResolvedValue({
                    results: {
                        new: expectedResult,
                    },
                } as MongoDbResults);

            // Act
            const result = await MoveGeneralInformationManagerService.updateStatus({
                move,
                status,
            });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(findOneAndUpdateSpy).toHaveBeenCalledTimes(1);
            expect(findOneAndUpdateSpy).toHaveBeenCalledWith(
                { _id: move.id },
                { status },
            );
            expect(updateSpy).not.toHaveBeenCalled();
        });

        it('should throw an error if status is invalid', async () =>
        {
            // Arrange
            const move = createPtuMoveCollectionData();
            const status = 'InvalidStatus' as PtuMoveStatus;
            const updateSpy = jest.spyOn(PtuMovePseudoCache, 'update');
            const findOneAndUpdateSpy = jest.spyOn(PtuMoveController, 'findOneAndUpdate');

            // Act & Assert
            await expect(
                MoveGeneralInformationManagerService.updateStatus({
                    userId,
                    move,
                    status,
                }),
            ).rejects.toThrow('Invalid status: InvalidStatus');
            expect(updateSpy).not.toHaveBeenCalled();
            expect(findOneAndUpdateSpy).not.toHaveBeenCalled();
        });

        it.each(
            Object.values(PtuMoveStatus),
        )('should not throw an error for valid status %s', async (status) =>
        {
            // Arrange
            const move = createPtuMoveCollectionData();
            const expectedResult = createPtuMoveCollectionData();
            const updateSpy = jest.spyOn(PtuMovePseudoCache, 'update')
                .mockResolvedValue(expectedResult);

            // Act & Assert
            await expect(
                MoveGeneralInformationManagerService.updateStatus({
                    userId,
                    move,
                    status,
                }),
            ).resolves.not.toThrow();
            expect(updateSpy).toHaveBeenCalled();
        });
    });

    describe(`method: ${MoveGeneralInformationManagerService.updateTransferredTo.name}`, () =>
    {
        it.each([true, false])('should update transfer status to %s', async (isTransferred) =>
        {
            // Arrange
            const move = createPtuMoveCollectionData();
            const expectedResult = createPtuMoveCollectionData();
            const findOneAndUpdateSpy = jest.spyOn(PtuMoveController, 'findOneAndUpdate')
                .mockResolvedValue({
                    results: {
                        new: expectedResult,
                    },
                } as MongoDbResults);

            // Act
            const result = await MoveGeneralInformationManagerService.updateTransferredTo({
                move,
                isTransferred,
            });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(findOneAndUpdateSpy).toHaveBeenCalledTimes(1);
            expect(findOneAndUpdateSpy).toHaveBeenCalledWith(
                { id: move.id },
                { isTransferred },
            );
        });
    });

    describe(`method: ${MoveGeneralInformationManagerService.updateType.name}`, () =>
    {
        it.each(
            Object.values(PokemonType),
        )('should update move type to %s', async (type) =>
        {
            // Arrange
            const move = createPtuMoveCollectionData();
            const expectedResult = createPtuMoveCollectionData();
            const updateSpy = jest.spyOn(PtuMovePseudoCache, 'update')
                .mockResolvedValue(expectedResult);

            // Act
            const result = await MoveGeneralInformationManagerService.updateType({
                userId,
                move,
                type,
            });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(updateSpy).toHaveBeenCalledTimes(1);
            expect(updateSpy).toHaveBeenCalledWith(
                { id: move.id },
                { type },
                userId,
            );
        });

        it.each([
            ['empty', ''],
            ['whitespace', '   '],
            ['invalid', 'INVALID'],
        ])('should throw an error if type is %s', async (_, type) =>
        {
            // Arrange
            const move = createPtuMoveCollectionData();
            const updateSpy = jest.spyOn(PtuMovePseudoCache, 'update');

            // Act & Assert
            await expect(
                MoveGeneralInformationManagerService.updateType({
                    userId,
                    move,
                    type,
                }),
            ).rejects.toThrow(`Invalid type: ${type}`);
            expect(updateSpy).not.toHaveBeenCalled();
        });
    });

    describe(`method: ${MoveGeneralInformationManagerService.updateCategory.name}`, () =>
    {
        it.each(
            Object.values(PokemonMoveCategory),
        )('should update move category to %s', async (category) =>
        {
            // Arrange
            const move = createPtuMoveCollectionData();
            const expectedResult = createPtuMoveCollectionData();
            const updateSpy = jest.spyOn(PtuMovePseudoCache, 'update')
                .mockResolvedValue(expectedResult);

            // Act
            const result = await MoveGeneralInformationManagerService.updateCategory({
                userId,
                move,
                category,
            });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(updateSpy).toHaveBeenCalledTimes(1);
            expect(updateSpy).toHaveBeenCalledWith(
                { id: move.id },
                { category },
                userId,
            );
        });

        it.each([
            ['empty', ''],
            ['whitespace', '   '],
            ['invalid', 'INVALID'],
        ])('should throw an error if category is %s', async (_, category) =>
        {
            // Arrange
            const move = createPtuMoveCollectionData();
            const updateSpy = jest.spyOn(PtuMovePseudoCache, 'update');

            // Act & Assert
            await expect(
                MoveGeneralInformationManagerService.updateCategory({
                    userId,
                    move,
                    category,
                }),
            ).rejects.toThrow(`Invalid category: ${category}`);
            expect(updateSpy).not.toHaveBeenCalled();
        });
    });

    describe(`method: ${MoveGeneralInformationManagerService.updateFrequency.name}`, () =>
    {
        it.each(
            Object.values(PtuCustomMoveFrequency),
        )('should update move frequency to %s', async (frequency) =>
        {
            // Arrange
            const move = createPtuMoveCollectionData();
            const expectedResult = createPtuMoveCollectionData();
            const updateSpy = jest.spyOn(PtuMovePseudoCache, 'update')
                .mockResolvedValue(expectedResult);

            // Act
            const result = await MoveGeneralInformationManagerService.updateFrequency({
                userId,
                move,
                frequency,
            });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(updateSpy).toHaveBeenCalledTimes(1);
            expect(updateSpy).toHaveBeenCalledWith(
                { id: move.id },
                { frequency },
                userId,
            );
        });

        it.each([
            ['empty', ''],
            ['whitespace', '   '],
            ['invalid', 'INVALID'],
        ])('should throw an error if frequency is %s', async (_, frequency) =>
        {
            // Arrange
            const move = createPtuMoveCollectionData();
            const updateSpy = jest.spyOn(PtuMovePseudoCache, 'update');

            // Act & Assert
            await expect(
                MoveGeneralInformationManagerService.updateFrequency({
                    userId,
                    move,
                    frequency,
                }),
            ).rejects.toThrow(`Invalid frequency: ${frequency}`);
            expect(updateSpy).not.toHaveBeenCalled();
        });
    });

    describe(`method: ${MoveGeneralInformationManagerService.updateDamageBase.name}`, () =>
    {
        it.each(
            Object.values(PtuCustomMoveDamageBase),
        )('should update move damage base to %s', async (damageBase) =>
        {
            // Arrange
            const move = createPtuMoveCollectionData();
            const expectedResult = createPtuMoveCollectionData();
            const updateSpy = jest.spyOn(PtuMovePseudoCache, 'update')
                .mockResolvedValue(expectedResult);

            // Act
            const result = await MoveGeneralInformationManagerService.updateDamageBase({
                userId,
                move,
                damageBase,
            });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(updateSpy).toHaveBeenCalledTimes(1);
            expect(updateSpy).toHaveBeenCalledWith(
                { id: move.id },
                { damageBase },
                userId,
            );
        });

        it.each([
            ['empty', ''],
            ['whitespace', '   '],
            ['invalid', 'INVALID'],
        ])('should throw an error if damage base is %s', async (_, damageBase) =>
        {
            // Arrange
            const move = createPtuMoveCollectionData();
            const updateSpy = jest.spyOn(PtuMovePseudoCache, 'update');

            // Act & Assert
            await expect(
                MoveGeneralInformationManagerService.updateDamageBase({
                    userId,
                    move,
                    damageBase,
                }),
            ).rejects.toThrow(`Invalid damageBase: ${damageBase}`);
            expect(updateSpy).not.toHaveBeenCalled();
        });
    });

    describe(`method: ${MoveGeneralInformationManagerService.updateArmorClass.name}`, () =>
    {
        it.each(
            Object.values(PtuCustomMoveArmorClass),
        )('should update move armor class to %s', async (ac) =>
        {
            // Arrange
            const move = createPtuMoveCollectionData();
            const expectedResult = createPtuMoveCollectionData();
            const updateSpy = jest.spyOn(PtuMovePseudoCache, 'update')
                .mockResolvedValue(expectedResult);

            // Act
            const result = await MoveGeneralInformationManagerService.updateArmorClass({
                userId,
                move,
                ac,
            });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(updateSpy).toHaveBeenCalledTimes(1);
            expect(updateSpy).toHaveBeenCalledWith(
                { id: move.id },
                { ac },
                userId,
            );
        });

        it.each([
            ['empty', ''],
            ['whitespace', '   '],
            ['invalid', 'INVALID'],
        ])('should throw an error if armor class is %s', async (_, ac) =>
        {
            // Arrange
            const move = createPtuMoveCollectionData();
            const updateSpy = jest.spyOn(PtuMovePseudoCache, 'update');

            // Act & Assert
            await expect(
                MoveGeneralInformationManagerService.updateArmorClass({
                    userId,
                    move,
                    ac,
                }),
            ).rejects.toThrow(`Invalid ac: ${ac}`);
            expect(updateSpy).not.toHaveBeenCalled();
        });
    });

    describe(`method: ${MoveGeneralInformationManagerService.updateContestStatEffect.name}`, () =>
    {
        it.each(
            Object.values(PtuContestStatEffect),
        )('should update move contest stat effect to %s', async (contestStatEffect) =>
        {
            // Arrange
            const move = createPtuMoveCollectionData();
            const expectedResult = createPtuMoveCollectionData();
            const updateSpy = jest.spyOn(PtuMovePseudoCache, 'update')
                .mockResolvedValue(expectedResult);

            // Act
            const result = await MoveGeneralInformationManagerService.updateContestStatEffect({
                userId,
                move,
                contestStatEffect,
            });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(updateSpy).toHaveBeenCalledTimes(1);
            expect(updateSpy).toHaveBeenCalledWith(
                { id: move.id },
                { contestStatEffect },
                userId,
            );
        });

        it.each([
            ['empty', ''],
            ['whitespace', '   '],
            ['invalid', 'INVALID'],
        ])('should throw an error if contest stat effect is %s', async (_, contestStatEffect) =>
        {
            // Arrange
            const move = createPtuMoveCollectionData();
            const updateSpy = jest.spyOn(PtuMovePseudoCache, 'update');

            // Act & Assert
            await expect(
                MoveGeneralInformationManagerService.updateContestStatEffect({
                    userId,
                    move,
                    contestStatEffect,
                }),
            ).rejects.toThrow(`Invalid contest stat effect: ${contestStatEffect}`);
            expect(updateSpy).not.toHaveBeenCalled();
        });
    });

    describe(`method: ${MoveGeneralInformationManagerService.updateContestStatType.name}`, () =>
    {
        it.each(
            Object.values(PtuContestStatType),
        )('should update move contest stat type to %s', async (contestStatType) =>
        {
            // Arrange
            const move = createPtuMoveCollectionData();
            const expectedResult = createPtuMoveCollectionData();
            const updateSpy = jest.spyOn(PtuMovePseudoCache, 'update')
                .mockResolvedValue(expectedResult);

            // Act
            const result = await MoveGeneralInformationManagerService.updateContestStatType({
                userId,
                move,
                contestStatType,
            });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(updateSpy).toHaveBeenCalledTimes(1);
            expect(updateSpy).toHaveBeenCalledWith(
                { id: move.id },
                { contestStatType },
                userId,
            );
        });

        it.each([
            ['empty', ''],
            ['whitespace', '   '],
            ['invalid', 'INVALID'],
        ])('should throw an error if contest stat type is %s', async (_, contestStatType) =>
        {
            // Arrange
            const move = createPtuMoveCollectionData();
            const updateSpy = jest.spyOn(PtuMovePseudoCache, 'update');

            // Act & Assert
            await expect(
                MoveGeneralInformationManagerService.updateContestStatType({
                    userId,
                    move,
                    contestStatType,
                }),
            ).rejects.toThrow(`Invalid contest stat type: ${contestStatType}`);
            expect(updateSpy).not.toHaveBeenCalled();
        });
    });

    describe(`method: ${MoveGeneralInformationManagerService.updateEffects.name}`, () =>
    {
        it('should update move effects', async () =>
        {
            // Arrange
            const move = createPtuMoveCollectionData();
            const effects = 'This is a description on what the move does.';
            const expectedResult = createPtuMoveCollectionData();
            const updateSpy = jest.spyOn(PtuMovePseudoCache, 'update')
                .mockResolvedValue(expectedResult);

            // Act
            const result = await MoveGeneralInformationManagerService.updateEffects({
                userId,
                move,
                effects,
            });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(updateSpy).toHaveBeenCalledTimes(1);
            expect(updateSpy).toHaveBeenCalledWith(
                { id: move.id },
                { effects },
                userId,
            );
        });

        it('should throw an error if effects is empty', async () =>
        {
            // Arrange
            const move = createPtuMoveCollectionData();
            const effects = '';
            const updateSpy = jest.spyOn(PtuMovePseudoCache, 'update');

            // Act & Assert
            await expect(
                MoveGeneralInformationManagerService.updateEffects({
                    userId,
                    move,
                    effects,
                }),
            ).rejects.toThrow('Move effects cannot be empty');
            expect(updateSpy).not.toHaveBeenCalled();
        });

        it('should throw an error if effects is only whitespace', async () =>
        {
            // Arrange
            const move = createPtuMoveCollectionData();
            const effects = '   ';
            const updateSpy = jest.spyOn(PtuMovePseudoCache, 'update');

            // Act & Assert
            await expect(
                MoveGeneralInformationManagerService.updateEffects({
                    userId,
                    move,
                    effects,
                }),
            ).rejects.toThrow('Move effects cannot be empty');
            expect(updateSpy).not.toHaveBeenCalled();
        });
    });

    describe(`method: ${MoveGeneralInformationManagerService.updateKeywords.name}`, () =>
    {
        beforeEach(() =>
        {
            MoveGeneralInformationManagerService['allKeywordNames'] = new Set<string>();
        });

        it.each([
            ['1 keyword', ['Keyword1']],
            ['2 keywords', ['Keyword1', 'Keyword2']],
            ['3 keywords', ['Keyword1', 'Keyword2', 'Keyword3']],
            ['4 keywords', ['Keyword1', 'Keyword2', 'Keyword3', 'Keyword4']],
        ])('should update move keywords with %s', async (_, keywords) =>
        {
            // Arrange
            MoveGeneralInformationManagerService['allKeywordNames'] = new Set(keywords);
            const move = createPtuMoveCollectionData();
            const expectedResult = createPtuMoveCollectionData();
            const updateSpy = jest.spyOn(PtuMovePseudoCache, 'update')
                .mockResolvedValue(expectedResult);

            // Act
            const result = await MoveGeneralInformationManagerService.updateKeywords({
                userId,
                move,
                keywords: keywords as [string?, string?, string?, string?],
            });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(updateSpy).toHaveBeenCalledTimes(1);
            expect(updateSpy).toHaveBeenCalledWith(
                { id: move.id },
                { keywords },
                userId,
            );
        });

        it('should trim whitespace from keywords before updating', async () =>
        {
            // Arrange
            const keywords = ['  Keyword1  ', ' Keyword2'] as [string?, string?, string?, string?];
            const trimmedKeywords = ['Keyword1', 'Keyword2'];
            MoveGeneralInformationManagerService['allKeywordNames'] = new Set(trimmedKeywords);
            const move = createPtuMoveCollectionData();
            const expectedResult = createPtuMoveCollectionData();
            const updateSpy = jest.spyOn(PtuMovePseudoCache, 'update')
                .mockResolvedValue(expectedResult);

            // Act
            const result = await MoveGeneralInformationManagerService.updateKeywords({
                userId,
                move,
                keywords,
            });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(updateSpy).toHaveBeenCalledTimes(1);
            expect(updateSpy).toHaveBeenCalledWith(
                { id: move.id },
                { keywords: trimmedKeywords },
                userId,
            );
        });

        it.each([
            ['undefined present', ['Keyword1', undefined]],
            ['empty string present', ['Keyword1', '']],
            ['whitespace present', ['Keyword1', '   ']],
        ])('should throw an error if keywords contains %s', async (_, keywords) =>
        {
            // Arrange
            const move = createPtuMoveCollectionData();
            const updateSpy = jest.spyOn(PtuMovePseudoCache, 'update');

            // Act & Assert
            await expect(
                MoveGeneralInformationManagerService.updateKeywords({
                    userId,
                    move,
                    keywords: keywords as [string?, string?, string?, string?],
                }),
            ).rejects.toThrow('Move cannot have empty keywords');
            expect(updateSpy).not.toHaveBeenCalled();
        });

        it('should throw an error if no keywords are provided', async () =>
        {
            // Arrange
            const move = createPtuMoveCollectionData();
            const updateSpy = jest.spyOn(PtuMovePseudoCache, 'update');

            // Act & Assert
            await expect(
                MoveGeneralInformationManagerService.updateKeywords({
                    userId,
                    move,
                    keywords: [],
                }),
            ).rejects.toThrow('Move must have 1-4 keywords');
            expect(updateSpy).not.toHaveBeenCalled();
        });

        it('should throw an error if more than four keywords are provided', async () =>
        {
            // Arrange
            const move = createPtuMoveCollectionData();
            const updateSpy = jest.spyOn(PtuMovePseudoCache, 'update');

            // Act & Assert
            await expect(
                MoveGeneralInformationManagerService.updateKeywords({
                    userId,
                    move,
                    keywords: ['Keyword1', 'Keyword2', 'Keyword3', 'Keyword4', 'Keyword5'] as unknown as [string?, string?, string?, string?],
                }),
            ).rejects.toThrow('Move must have 1-4 keywords');
            expect(updateSpy).not.toHaveBeenCalled();
        });

        it('should throw an error if any keyword is invalid', async () =>
        {
            // Arrange
            const move = createPtuMoveCollectionData();
            const keywords = ['ValidKeyword', 'InvalidKeyword1', 'InvalidKeyword2'] as [string?, string?, string?, string?];
            MoveGeneralInformationManagerService['allKeywordNames'] = new Set(['ValidKeyword']);
            const updateSpy = jest.spyOn(PtuMovePseudoCache, 'update');

            // Act & Assert
            await expect(
                MoveGeneralInformationManagerService.updateKeywords({
                    userId,
                    move,
                    keywords,
                }),
            ).rejects.toThrow('Invalid keywords: InvalidKeyword1, InvalidKeyword2');
            expect(updateSpy).not.toHaveBeenCalled();
        });

        it('should call getValidKeywordNames with returnType set', async () =>
        {
            // Arrange
            const move = createPtuMoveCollectionData();
            const expectedResult = createPtuMoveCollectionData();
            const keywords = ['Keyword1'] as [string?, string?, string?, string?];
            MoveGeneralInformationManagerService['allKeywordNames'] = new Set(keywords);
            jest.spyOn(PtuMovePseudoCache, 'update')
                .mockResolvedValue(expectedResult);
            const getValidKeywordNamesSpy = jest.spyOn(MoveGeneralInformationManagerService, 'getValidKeywordNames');

            // Act
            await MoveGeneralInformationManagerService.updateKeywords({
                userId,
                move,
                keywords,
            });

            // Assert
            expect(getValidKeywordNamesSpy).toHaveBeenCalledTimes(1);
            expect(getValidKeywordNamesSpy).toHaveBeenCalledWith({ returnType: 'set' });
        });
    });

    describe(`method: ${MoveGeneralInformationManagerService.updateBasedOn.name}`, () =>
    {
        beforeEach(() =>
        {
            MoveGeneralInformationManagerService['allMoveNames'] = new Set<string>();
        });

        const moveNames = Array.from(
            { length: 50 },
            () =>
            {
                const numOfNouns = faker.number.int({ min: 1, max: 3 });
                return Array.from(
                    { length: numOfNouns },
                    () => faker.word.noun(),
                ).join(' ');
            },
        );

        it.each(
            moveNames.slice(3),
        )(`should update move's based on move name to %s`, async (basedOnMoveName) =>
        {
            // Arrange
            MoveGeneralInformationManagerService['allMoveNames'] = new Set(moveNames);
            const move = createPtuMoveCollectionData();
            const expectedResult = createPtuMoveCollectionData();
            const getLookupDataSpy = jest.spyOn(LookupMoveStrategy, 'getLookupData')
                .mockResolvedValue(moveNames.map(name => ({ name })));
            const updateSpy = jest.spyOn(PtuMovePseudoCache, 'update')
                .mockResolvedValue(expectedResult);

            // Act
            const result = await MoveGeneralInformationManagerService.updateBasedOn({
                userId,
                move,
                basedOnMoveName,
            });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(getLookupDataSpy).toHaveBeenCalledTimes(0);
            expect(updateSpy).toHaveBeenCalledTimes(1);
            expect(updateSpy).toHaveBeenCalledWith(
                { id: move.id },
                { basedOn: basedOnMoveName },
                userId,
            );
        });

        it.each([
            ['empty', ''],
            ['whitespace', '   '],
            ['invalid', 'INVALID'],
        ])('should throw an error if based on move name is %s', async (_, basedOnMoveName) =>
        {
            // Arrange
            MoveGeneralInformationManagerService['allMoveNames'] = new Set(moveNames);
            const move = createPtuMoveCollectionData();
            const getLookupDataSpy = jest.spyOn(LookupMoveStrategy, 'getLookupData')
                .mockResolvedValue(moveNames.map(name => ({ name })));
            const updateSpy = jest.spyOn(PtuMovePseudoCache, 'update');

            // Act & Assert
            await expect(
                MoveGeneralInformationManagerService.updateBasedOn({
                    userId,
                    move,
                    basedOnMoveName,
                }),
            ).rejects.toThrow(`Invalid based on move name: ${basedOnMoveName}`);
            expect(getLookupDataSpy).toHaveBeenCalledTimes(0);
            expect(updateSpy).not.toHaveBeenCalled();
        });

        it('should update private allMoveNames if it is not yet set', async () =>
        {
            // Arrange
            MoveGeneralInformationManagerService['allMoveNames'] = new Set<string>([]);
            const move = createPtuMoveCollectionData();
            const expectedResult = createPtuMoveCollectionData();
            const getLookupDataSpy = jest.spyOn(LookupMoveStrategy, 'getLookupData')
                .mockResolvedValue(moveNames.map(name => ({ name })));
            jest.spyOn(PtuMovePseudoCache, 'update')
                .mockResolvedValue(expectedResult);

            // Act
            await MoveGeneralInformationManagerService.updateBasedOn({
                userId,
                move,
                basedOnMoveName: moveNames[0],
            });

            // Assert
            expect(getLookupDataSpy).toHaveBeenCalledTimes(1);
            expect(getLookupDataSpy).toHaveBeenCalledWith({ includeAllIfNoName: true });
            expect(MoveGeneralInformationManagerService['allMoveNames']).toEqual(new Set(moveNames));
        });
    });

    describe(`method: ${MoveGeneralInformationManagerService.getValidKeywordNames.name}`, () =>
    {
        beforeEach(() =>
        {
            MoveGeneralInformationManagerService['allKeywordNames'] = new Set<string>();
        });

        const keywordNames = getRandomKeywords(50);

        describe.each([
            ['set', 'set'],
            ['array', 'array'],
            ['empty', ''],
            ['undefined', undefined],
        ])(`return type: %s`, (_, returnType) =>
        {
            it('should return allKeywordNames if it is already set', async () =>
            {
                // Arrange
                MoveGeneralInformationManagerService['allKeywordNames'] = new Set<string>(keywordNames);
                const expectedResult = returnType === 'set'
                    ? new Set(keywordNames)
                    : keywordNames;
                const getLookupDataSpy = jest.spyOn(LookupKeywordStrategy, 'getLookupData')
                    .mockResolvedValue(keywordNames.map(name => ({
                        name,
                        type: PtuKeywordType.Move,
                    })));

                // Act
                const result = await MoveGeneralInformationManagerService.getValidKeywordNames({
                    returnType,
                });

                // Assert
                expect(getLookupDataSpy).toHaveBeenCalledTimes(0);
                expect(result).toEqual(expectedResult);
            });

            it('should only add Move keywords to allKeywordNames', async () =>
            {
                // Arrange
                MoveGeneralInformationManagerService['allKeywordNames'] = new Set<string>([]);
                const getLookupDataSpy = jest.spyOn(LookupKeywordStrategy, 'getLookupData')
                    .mockResolvedValue([
                        {
                            name: 'Keyword1',
                            type: PtuKeywordType.Ability,
                        },
                        {
                            name: 'Keyword2',
                            type: PtuKeywordType.Move,
                        },
                        {
                            name: 'Keyword3',
                            type: PtuKeywordType.Ability,
                        },
                        {
                            name: 'Keyword4',
                            type: PtuKeywordType.Move,
                        },
                        {
                            name: 'Keyword5',
                            type: PtuKeywordType.Ability,
                        },
                    ]);

                // Act
                await MoveGeneralInformationManagerService.getValidKeywordNames({
                    returnType,
                });

                // Assert
                expect(getLookupDataSpy).toHaveBeenCalledTimes(1);
                expect(getLookupDataSpy).toHaveBeenCalledWith({ includeAllIfNoName: true });
                expect(MoveGeneralInformationManagerService['allKeywordNames']).toEqual(new Set(['Keyword2', 'Keyword4']));
            });

            it('should update private allKeywordNames if it is not yet set for returnType', async () =>
            {
                // Arrange
                MoveGeneralInformationManagerService['allKeywordNames'] = new Set<string>([]);
                const getLookupDataSpy = jest.spyOn(LookupKeywordStrategy, 'getLookupData')
                    .mockResolvedValue(keywordNames.map(name => ({
                        name,
                        type: PtuKeywordType.Move,
                    })));

                // Act
                await MoveGeneralInformationManagerService.getValidKeywordNames({
                    returnType,
                });

                // Assert
                expect(getLookupDataSpy).toHaveBeenCalledTimes(1);
                expect(getLookupDataSpy).toHaveBeenCalledWith({ includeAllIfNoName: true });
                expect(MoveGeneralInformationManagerService['allKeywordNames']).toEqual(new Set(keywordNames));
            });
        });
    });
});
