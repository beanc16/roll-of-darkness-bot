/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
// ^ the above are giving a lot of false negatives for some reason, temporarily disabling

import { PtuFakemonPseudoCache } from '../../../dal/PtuFakemonPseudoCache';
import { createPtuFakemonCollectionData } from '../../../fakes/PtuFakemonCollection.fakes';
import { PtuHeight } from '../../../types/pokemon';
import { PtuSizeAdapterService } from '../../PtuSizeAdapterService/PtuSizeAdapterService';
import { FakemonSizeManagerService } from '../FakemonSizeManagerService';

jest.mock('mongodb-controller');
jest.mock('../../../dal/PtuFakemonController');
jest.mock('../../../dal/PtuFakemonPseudoCache', () =>
{
    return {
        PtuFakemonPseudoCache: {
            update: jest.fn(),
        },
    };
});
jest.mock('../../PtuSizeAdapterService/PtuSizeAdapterService', () =>
{
    return {
        PtuSizeAdapterService: {
            adaptWeight: jest.fn(),
            adaptHeight: jest.fn(),
        },
    };
});

describe(`class: ${FakemonSizeManagerService.name}`, () =>
{
    beforeEach(() =>
    {
        jest.clearAllMocks();
    });

    describe(`method: ${FakemonSizeManagerService.setWeight.name}`, () =>
    {
        it(`should update the fakemon's weight`, async () =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData();
            const expectedWeight = {
                freedom: `58.6lbs`,
                metric: '26.6kg',
                ptu: 3,
            };
            const expectedResult = createPtuFakemonCollectionData();
            const adaptSpy = jest.spyOn(PtuSizeAdapterService, 'adaptWeight')
                .mockReturnValue(expectedWeight);
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                .mockResolvedValue(expectedResult);

            // Act
            const result = await FakemonSizeManagerService.setWeight({
                messageId,
                fakemon,
                lbs: 58.6,
            });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(adaptSpy).toHaveBeenCalledWith(58.6, fakemon.abilities);
            expect(updateSpy).toHaveBeenCalledWith(
                messageId,
                { id: fakemon.id },
                {
                    sizeInformation: {
                        ...fakemon.sizeInformation,
                        weight: expectedWeight,
                    },
                },
            );
        });
    });

    describe(`method: ${FakemonSizeManagerService.setHeight.name}`, () =>
    {
        it(`should update the fakemon's height`, async () =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData();
            const expectedHeight = {
                freedom: `4'7"`,
                metric: '1.4m',
                ptu: PtuHeight.Medium,
            };
            const expectedResult = createPtuFakemonCollectionData();
            const adaptSpy = jest.spyOn(PtuSizeAdapterService, 'adaptHeight')
                .mockReturnValue(expectedHeight);
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                .mockResolvedValue(expectedResult);

            // Act
            const result = await FakemonSizeManagerService.setHeight({
                messageId,
                fakemon,
                ft: 4,
                inches: 7,
            });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(adaptSpy).toHaveBeenCalledWith(4, 7);
            expect(updateSpy).toHaveBeenCalledWith(
                messageId,
                { id: fakemon.id },
                {
                    sizeInformation: {
                        ...fakemon.sizeInformation,
                        height: expectedHeight,
                    },
                },
            );
        });
    });

    describe(`method: ${FakemonSizeManagerService.getHeightFromString.name}`, () =>
    {
        it('should return feet and inches for integers', () =>
        {
            // Act
            const result = FakemonSizeManagerService.getHeightFromString(`3'11"`);

            // Assert
            expect(result).toEqual({ feet: 3, inches: 11 });
        });

        it('should throw an error if feet and inches are decimals', () =>
        {
            // Act & Assert
            expect(() =>
                FakemonSizeManagerService.getHeightFromString(`1.2'3.4"`),
            ).toThrow(`Invalid feet/inches format: "1.2'3.4""`);
        });

        it('should throw an error if input is in an invalid format', () =>
        {
            // Act & Assert
            expect(() =>
                FakemonSizeManagerService.getHeightFromString('invalid'),
            ).toThrow(`Invalid feet/inches format: "invalid"`);
        });
    });
});
