/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
// ^ the above are giving a lot of false negatives for some reason, temporarily disabling

import { faker } from '@faker-js/faker';

import { FakemonSkillsEditStringSelectElementOptions } from '../../../components/fakemon/actionRowBuilders/FakemonSkillsEditStringSelectActionRowBuilder';
import { PtuFakemonPseudoCache } from '../../../dal/PtuFakemonPseudoCache';
import { createPtuFakemonCollectionData } from '../../../fakes/PtuFakemonCollection.fakes';
import { FakemonSkillManagerService } from '../FakemonSkillManagerService';

jest.mock('mongodb-controller');
jest.mock('../../../dal/PtuFakemonController');
jest.mock('../../../dal/PtuFakemonPseudoCache', () =>
{
    return {
        PtuFakemonPseudoCache: {
            getByMessageId: jest.fn(),
            update: jest.fn(),
        },
    };
});

describe(`class: ${FakemonSkillManagerService.name}`, () =>
{
    beforeEach(() =>
    {
        jest.clearAllMocks();
    });

    describe(`method: ${FakemonSkillManagerService.getSkillKey.name}`, () =>
    {
        it.each([
            ['athletics', FakemonSkillsEditStringSelectElementOptions.Athletics],
            ['acrobatics', FakemonSkillsEditStringSelectElementOptions.Acrobatics],
            ['combat', FakemonSkillsEditStringSelectElementOptions.Combat],
            ['stealth', FakemonSkillsEditStringSelectElementOptions.Stealth],
            ['perception', FakemonSkillsEditStringSelectElementOptions.Perception],
            ['focus', FakemonSkillsEditStringSelectElementOptions.Focus],
        ])(`should return '%s' for '%s'`, (expectedSkillKey, skillToEdit) =>
        {
            // Act
            const result = FakemonSkillManagerService.getSkillKey(skillToEdit);

            // Assert
            expect(result).toEqual(expectedSkillKey);
        });

        it('should throw an error if skillToEdit is not a valid FakemonSkillsEditStringSelectElementOptions', () =>
        {
            // Act & Assert
            expect(() =>
                FakemonSkillManagerService.getSkillKey('invalid' as FakemonSkillsEditStringSelectElementOptions),
            ).toThrow(`Unhandled skillToEdit: invalid`);
        });
    });

    describe(`method: ${FakemonSkillManagerService.getSkillDiceAndModifier.name}`, () =>
    {
        it.each(
            Object.values(FakemonSkillsEditStringSelectElementOptions),
        )(`should return the skill dice and modifier for '%s'`, (skillToEdit) =>
        {
            // Arrange
            const messageId = 'messageId';
            const expectedSkillKey = FakemonSkillManagerService.getSkillKey(skillToEdit);
            const expectedSkillDice = 1;
            const expectedSkillModifier = 1;
            const fakemon = createPtuFakemonCollectionData();
            const getByMessageIdSpy = jest.spyOn(PtuFakemonPseudoCache, 'getByMessageId')
                .mockReturnValue({
                    ...fakemon,
                    skills: {
                        ...fakemon.skills,
                        [expectedSkillKey]: `${expectedSkillDice}d6+${expectedSkillModifier}`,
                    },
                } as typeof fakemon);

            // Act
            const result = FakemonSkillManagerService.getSkillDiceAndModifier(messageId, skillToEdit);

            // Assert
            expect(result).toEqual({
                skillDice: expectedSkillDice,
                skillModifier: expectedSkillModifier,
            });
            expect(getByMessageIdSpy).toHaveBeenCalledWith(messageId);
        });

        it('should throw an error if fakemon is not found', () =>
        {
            // Arrange
            const messageId = 'messageId';
            const getByMessageIdSpy = jest.spyOn(PtuFakemonPseudoCache, 'getByMessageId')
                .mockReturnValue(undefined);

            // Assert
            expect(() =>
                FakemonSkillManagerService.getSkillDiceAndModifier(messageId, FakemonSkillsEditStringSelectElementOptions.Acrobatics),
            ).toThrow('Fakemon not found');
            expect(getByMessageIdSpy).toHaveBeenCalledWith(messageId);
        });
    });

    describe(`method: ${FakemonSkillManagerService.setSkill.name}`, () =>
    {
        it.each(
            Object.values(FakemonSkillsEditStringSelectElementOptions),
        )(`should update the '%s' skill in the fakemon (positive modifier)`, async (skillToEdit) =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData();
            const expectedResult = createPtuFakemonCollectionData();
            const expectedSkillDice = faker.number.int({ min: 1, max: 6 });
            const expectedSkillModifier = faker.number.int({ min: 0, max: 6 });
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                .mockResolvedValue(expectedResult);

            // Act
            const result = await FakemonSkillManagerService.setSkill({
                messageId,
                fakemon,
                skillToEdit,
                skillDice: expectedSkillDice,
                skillModifier: expectedSkillModifier,
            });

            // Assert
            const expectedSkillKey = FakemonSkillManagerService.getSkillKey(skillToEdit);
            expect(result).toEqual(expectedResult);
            expect(updateSpy).toHaveBeenCalledWith(
                messageId,
                { id: fakemon.id },
                {
                    skills: {
                        ...fakemon.skills,
                        [expectedSkillKey]: `${expectedSkillDice}d6+${expectedSkillModifier}`,
                    },
                },
            );
        });

        it.each(
            Object.values(FakemonSkillsEditStringSelectElementOptions),
        )(`should update the '%s' skill in the fakemon (negative modifier)`, async (skillToEdit) =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData();
            const expectedResult = createPtuFakemonCollectionData();
            const expectedSkillDice = faker.number.int({ min: 1, max: 6 });
            const expectedSkillModifier = faker.number.int({ min: -6, max: -1 });
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                .mockResolvedValue(expectedResult);

            // Act
            const result = await FakemonSkillManagerService.setSkill({
                messageId,
                fakemon,
                skillToEdit,
                skillDice: expectedSkillDice,
                skillModifier: expectedSkillModifier,
            });

            // Assert
            const expectedSkillKey = FakemonSkillManagerService.getSkillKey(skillToEdit);
            expect(result).toEqual(expectedResult);
            expect(updateSpy).toHaveBeenCalledWith(
                messageId,
                { id: fakemon.id },
                {
                    skills: {
                        ...fakemon.skills,
                        [expectedSkillKey]: `${expectedSkillDice}d6${expectedSkillModifier}`,
                    },
                },
            );
        });

        it.each([1, 2, 3, 4, 5, 6])('should not throw an error if skill dice is %s (AKA: 1-6 inclusive)', async (skillDice) =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update');

            // Act & Assert
            await expect(
                FakemonSkillManagerService.setSkill({
                    messageId,
                    fakemon,
                    skillToEdit: FakemonSkillsEditStringSelectElementOptions.Athletics,
                    skillDice,
                    skillModifier: 1,
                }),
            ).resolves.not.toThrow();
            expect(updateSpy).toHaveBeenCalled();
        });

        it.each([-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6])('should not throw an error if skill modifier is %s (AKA: 1-6 inclusive)', async (skillModifier) =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update');

            // Act & Assert
            await expect(
                FakemonSkillManagerService.setSkill({
                    messageId,
                    fakemon,
                    skillToEdit: FakemonSkillsEditStringSelectElementOptions.Athletics,
                    skillDice: 1,
                    skillModifier,
                }),
            ).resolves.not.toThrow();
            expect(updateSpy).toHaveBeenCalled();
        });

        it.each([0, -1, -2, -3])('should throw an error if skill dice is %s (AKA: less than 1)', async (skillDice) =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update');

            // Act & Assert
            await expect(
                FakemonSkillManagerService.setSkill({
                    messageId,
                    fakemon,
                    skillToEdit: FakemonSkillsEditStringSelectElementOptions.Athletics,
                    skillDice,
                    skillModifier: 1,
                }),
            ).rejects.toThrow('Skill dice cannot be less than 1');
            expect(updateSpy).not.toHaveBeenCalled();
        });

        it.each([7, 8, 9, 10])('should throw an error if skill dice is %s (AKA: greater than 6)', async (skillDice) =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update');

            // Act & Assert
            await expect(
                FakemonSkillManagerService.setSkill({
                    messageId,
                    fakemon,
                    skillToEdit: FakemonSkillsEditStringSelectElementOptions.Athletics,
                    skillDice,
                    skillModifier: 1,
                }),
            ).rejects.toThrow('Skill dice cannot be greater than 6');
            expect(updateSpy).not.toHaveBeenCalled();
        });

        it.each([-7, -8, -9, -10])('should throw an error if skill modifier is %s (AKA: less than -6)', async (skillModifier) =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update');

            // Act & Assert
            await expect(
                FakemonSkillManagerService.setSkill({
                    messageId,
                    fakemon,
                    skillToEdit: FakemonSkillsEditStringSelectElementOptions.Athletics,
                    skillDice: 1,
                    skillModifier,
                }),
            ).rejects.toThrow('Skill modifier cannot be less than -6');
            expect(updateSpy).not.toHaveBeenCalled();
        });

        it.each([7, 8, 9, 10])('should throw an error if skill modifier is %s (AKA: greater than 6)', async (skillModifier) =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update');

            // Act & Assert
            await expect(
                FakemonSkillManagerService.setSkill({
                    messageId,
                    fakemon,
                    skillToEdit: FakemonSkillsEditStringSelectElementOptions.Athletics,
                    skillDice: 1,
                    skillModifier,
                }),
            ).rejects.toThrow('Skill modifier cannot be greater than 6');
            expect(updateSpy).not.toHaveBeenCalled();
        });

        it('should throw an error if skillToEdit is not FakemonSkillsEditStringSelectElementOptions', async () =>
        {
            // Arrange
            const messageId = 'messageId';
            const fakemon = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update');

            // Act & Assert
            await expect(
                FakemonSkillManagerService.setSkill({
                    messageId,
                    fakemon,
                    skillToEdit: 'INVALID' as FakemonSkillsEditStringSelectElementOptions,
                    skillDice: 1,
                    skillModifier: 1,
                }),
            ).rejects.toThrow('Unhandled skillToEdit: INVALID');
            expect(updateSpy).not.toHaveBeenCalled();
        });
    });

    describe(`method: ${FakemonSkillManagerService['formatSkill'].name}`, () =>
    {
        it('should format skill with positive modifier', () =>
        {
            // Arrange
            const skillDice = 1;
            const skillModifier = 1;

            // Act
            const formattedSkill = FakemonSkillManagerService['formatSkill']({
                skillDice,
                skillModifier,
            });

            // Assert
            expect(formattedSkill).toBe(`${skillDice}d6+${skillModifier}`);
        });

        it('should format skill with negative modifier', () =>
        {
            // Arrange
            const skillDice = 1;
            const skillModifier = -1;

            // Act
            const formattedSkill = FakemonSkillManagerService['formatSkill']({
                skillDice,
                skillModifier,
            });

            // Assert
            expect(formattedSkill).toBe(`${skillDice}d6${skillModifier}`);
        });

        it('should format skill with a 0 modifier as a positive modifier', () =>
        {
            // Arrange
            const skillDice = 1;
            const skillModifier = 0;

            // Act
            const formattedSkill = FakemonSkillManagerService['formatSkill']({
                skillDice,
                skillModifier,
            });

            // Assert
            expect(formattedSkill).toBe(`${skillDice}d6+${skillModifier}`);
        });
    });

    describe(`method: ${FakemonSkillManagerService['deconstructSkillString'].name}`, () =>
    {
        it.each([
            ['positive', 1],
            ['zero', 0],
        ])('should return skill dice and %s modifier', (_, skillModifier) =>
        {
            // Arrange
            const skillDice = 1;

            // Act
            const formattedSkill = FakemonSkillManagerService['deconstructSkillString'](`${skillDice}d6+${skillModifier}`);

            // Assert
            expect(formattedSkill).toEqual({ skillDice, skillModifier });
        });

        it('should return skill dice and negative modifier', () =>
        {
            // Arrange
            const skillDice = 1;
            const skillModifier = -1;

            // Act
            const formattedSkill = FakemonSkillManagerService['deconstructSkillString'](`${skillDice}d6${skillModifier}`);

            // Assert
            expect(formattedSkill).toEqual({ skillDice, skillModifier });
        });

        it('should throw error for invalid skill string', () =>
        {
            // Arrange
            const skillDice = 'a';
            const skillModifier = 'b';

            // Act & Assert
            expect(() =>
                FakemonSkillManagerService['deconstructSkillString'](`${skillDice}d6${skillModifier}`),
            ).toThrow('Invalid skill string');
        });

        it('should throw error if skill dice is a decimal', () =>
        {
            // Arrange
            const skillDice = 1.5;
            const skillModifier = 1;

            // Act & Assert
            expect(() =>
                FakemonSkillManagerService['deconstructSkillString'](`${skillDice}d6${skillModifier}`),
            ).toThrow('Invalid skill string');
        });

        it('should throw error if skill modifier is a decimal', () =>
        {
            // Arrange
            const skillDice = 1;
            const skillModifier = 1.5;

            // Act & Assert
            expect(() =>
                FakemonSkillManagerService['deconstructSkillString'](`${skillDice}d6${skillModifier}`),
            ).toThrow('Invalid skill string');
        });
    });

    describe(`method: ${FakemonSkillManagerService.addSignToSkillModifier.name}`, () =>
    {
        it.each([0, 1, 2, 3, 4, 5, 6])('should add a plus sign for %s (AKA: positive or zero modifier)', (skillModifier) =>
        {
            // Act
            const result = FakemonSkillManagerService.addSignToSkillModifier(skillModifier);

            // Assert
            expect(result).toBe(`+${skillModifier}`);
        });

        it.each([-6, -5, -4, -3, -2, -1])('should not add a sign for %s (AKA: negative modifier that already has a negative sign)', (skillModifier) =>
        {
            // Act
            const result = FakemonSkillManagerService.addSignToSkillModifier(skillModifier);

            // Assert
            expect(result).toBe(`${skillModifier}`);
        });
    });
});
