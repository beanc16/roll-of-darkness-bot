/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
// ^ the above are giving a lot of false negatives for some reason, temporarily disabling

import type { ChatInputCommandInteraction } from 'discord.js';

import { FakeChatInputCommandInteraction } from '../../../../../fakes/discord/interactions';
import { DiceLiteService } from '../../../../../services/Dice/DiceLiteService';
import { PtuSkill } from '../../../types/pokemonTrainers';
import { GenerateSkillBackgroundStrategy } from '../GenerateSkillBackgroundStrategy';

// This mock is necessary to prevent an ESM export error with @swc/jest
jest.mock('@beanc16/microservices-abstraction', () =>
{
    return {};
});

jest.mock('../../../../../services/Dice/DiceLiteService', () =>
{
    return {
        DiceLiteService: jest.fn().mockImplementation(() => ({
            roll: jest.fn(),
        })),
    };
});

describe(`class: ${GenerateSkillBackgroundStrategy.name}`, () =>
{
    let mockInteraction: Partial<ChatInputCommandInteraction>;

    beforeEach(() =>
    {
        jest.clearAllMocks();
        mockInteraction = new FakeChatInputCommandInteraction();
    });

    describe(`method: ${GenerateSkillBackgroundStrategy['getSkills'].name}`, () =>
    {
        describe('when all skills are provided', () =>
        {
            it('should return all provided raised and lowered skills without generating random ones', () =>
            {
                // Arrange
                (mockInteraction.options!.getString as jest.Mock)
                    .mockReturnValueOnce(PtuSkill.Acrobatics)
                    .mockReturnValueOnce(PtuSkill.Athletics)
                    .mockReturnValueOnce(PtuSkill.Charm)
                    .mockReturnValueOnce(PtuSkill.Combat)
                    .mockReturnValueOnce(PtuSkill.Command)
                    .mockReturnValueOnce(PtuSkill.Focus);

                // Act
                const result = GenerateSkillBackgroundStrategy['getSkills'](mockInteraction as ChatInputCommandInteraction);

                // Assert
                expect(result.raisedSkills).toEqual([PtuSkill.Acrobatics, PtuSkill.Athletics, PtuSkill.Charm]);
                expect(result.loweredSkills).toEqual([PtuSkill.Combat, PtuSkill.Command, PtuSkill.Focus]);
                expect(result.raisedSkills.length).toBe(3);
                expect(result.loweredSkills.length).toBe(3);
            });

            it('should have all unique raised skills', () =>
            {
                // Arrange
                (mockInteraction.options!.getString as jest.Mock)
                    .mockReturnValueOnce(PtuSkill.Acrobatics)
                    .mockReturnValueOnce(PtuSkill.Athletics)
                    .mockReturnValueOnce(PtuSkill.Charm)
                    .mockReturnValueOnce(PtuSkill.Combat)
                    .mockReturnValueOnce(PtuSkill.Command)
                    .mockReturnValueOnce(PtuSkill.Focus);

                // Act
                const result = GenerateSkillBackgroundStrategy['getSkills'](mockInteraction as ChatInputCommandInteraction);

                // Assert
                const uniqueRaisedSkills = new Set(result.raisedSkills);
                expect(uniqueRaisedSkills.size).toBe(result.raisedSkills.length);
            });

            it('should have all unique lowered skills', () =>
            {
                // Arrange
                (mockInteraction.options!.getString as jest.Mock)
                    .mockReturnValueOnce(PtuSkill.Acrobatics)
                    .mockReturnValueOnce(PtuSkill.Athletics)
                    .mockReturnValueOnce(PtuSkill.Charm)
                    .mockReturnValueOnce(PtuSkill.Combat)
                    .mockReturnValueOnce(PtuSkill.Command)
                    .mockReturnValueOnce(PtuSkill.Focus);

                // Act
                const result = GenerateSkillBackgroundStrategy['getSkills'](mockInteraction as ChatInputCommandInteraction);

                // Assert
                const uniqueLoweredSkills = new Set(result.loweredSkills);
                expect(uniqueLoweredSkills.size).toBe(result.loweredSkills.length);
            });
        });

        describe('when no skills are provided', () =>
        {
            it('should generate 2 random raised skills and 2 random lowered skills', () =>
            {
                // Arrange
                (mockInteraction.options!.getString as jest.Mock).mockReturnValue(null);
                const rollMock = jest.fn()
                    .mockReturnValueOnce([1])
                    .mockReturnValueOnce([2])
                    .mockReturnValueOnce([3])
                    .mockReturnValueOnce([4]);
                (DiceLiteService as jest.Mock).mockImplementation(() => ({
                    roll: rollMock,
                }));

                // Act
                const result = GenerateSkillBackgroundStrategy['getSkills'](mockInteraction as ChatInputCommandInteraction);

                // Assert
                expect(result.raisedSkills.length).toBe(2);
                expect(result.loweredSkills.length).toBe(2);
                expect(rollMock).toHaveBeenCalledTimes(4);
            });

            it('should have all valid raised skills', () =>
            {
                // Arrange
                (mockInteraction.options!.getString as jest.Mock).mockReturnValue(null);
                const rollMock = jest.fn()
                    .mockReturnValueOnce([1])
                    .mockReturnValueOnce([2])
                    .mockReturnValueOnce([3])
                    .mockReturnValueOnce([4]);
                (DiceLiteService as jest.Mock).mockImplementation(() => ({
                    roll: rollMock,
                }));

                // Act
                const result = GenerateSkillBackgroundStrategy['getSkills'](mockInteraction as ChatInputCommandInteraction);

                // Assert
                result.raisedSkills.forEach((skill) =>
                {
                    expect(skill).toBeDefined();
                    expect(skill).not.toBeNull();
                    expect(typeof skill).toBe('string');
                    expect(GenerateSkillBackgroundStrategy['validSkills']).toContain(skill);
                });
            });

            it('should have all valid lowered skills', () =>
            {
                // Arrange
                (mockInteraction.options!.getString as jest.Mock).mockReturnValue(null);
                const rollMock = jest.fn()
                    .mockReturnValueOnce([1])
                    .mockReturnValueOnce([2])
                    .mockReturnValueOnce([3])
                    .mockReturnValueOnce([4]);
                (DiceLiteService as jest.Mock).mockImplementation(() => ({
                    roll: rollMock,
                }));

                // Act
                const result = GenerateSkillBackgroundStrategy['getSkills'](mockInteraction as ChatInputCommandInteraction);

                // Assert
                result.loweredSkills.forEach((skill) =>
                {
                    expect(skill).toBeDefined();
                    expect(skill).not.toBeNull();
                    expect(typeof skill).toBe('string');
                    expect(GenerateSkillBackgroundStrategy['validSkills']).toContain(skill);
                });
            });

            it.each([
                ['different', [1, 2, 3, 4]],
                ['the same', [1, 1, 1, 1]],
            ])('should have all unique raised skills when roll results are %s', (_, rollResults) =>
            {
                // Arrange
                (mockInteraction.options!.getString as jest.Mock).mockReturnValue(null);
                const rollMock = jest.fn()
                    .mockReturnValueOnce([rollResults[0]])
                    .mockReturnValueOnce([rollResults[1]])
                    .mockReturnValueOnce([rollResults[2]])
                    .mockReturnValueOnce([rollResults[3]]);
                (DiceLiteService as jest.Mock).mockImplementation(() => ({
                    roll: rollMock,
                }));

                // Act
                const result = GenerateSkillBackgroundStrategy['getSkills'](mockInteraction as ChatInputCommandInteraction);

                // Assert
                const uniqueRaisedSkills = new Set(result.raisedSkills);
                expect(uniqueRaisedSkills.size).toBe(result.raisedSkills.length);
            });

            it.each([
                ['different', [1, 2, 3, 4]],
                ['the same', [1, 1, 1, 1]],
            ])('should have all unique lowered skills when roll results are %s', (_, rollResults) =>
            {
                // Arrange
                (mockInteraction.options!.getString as jest.Mock).mockReturnValue(null);
                const rollMock = jest.fn()
                    .mockReturnValueOnce([rollResults[0]])
                    .mockReturnValueOnce([rollResults[1]])
                    .mockReturnValueOnce([rollResults[2]])
                    .mockReturnValueOnce([rollResults[3]]);
                (DiceLiteService as jest.Mock).mockImplementation(() => ({
                    roll: rollMock,
                }));

                // Act
                const result = GenerateSkillBackgroundStrategy['getSkills'](mockInteraction as ChatInputCommandInteraction);

                // Assert
                const uniqueLoweredSkills = new Set(result.loweredSkills);
                expect(uniqueLoweredSkills.size).toBe(result.loweredSkills.length);
            });

            it.each([
                ['different', [1, 2, 3, 4]],
                ['the same', [1, 1, 1, 1]],
            ])('should have no overlap between raised and lowered skills when roll results are %s', (_, rollResults) =>
            {
                // Arrange
                (mockInteraction.options!.getString as jest.Mock).mockReturnValue(null);
                const rollMock = jest.fn()
                    .mockReturnValueOnce([rollResults[0]])
                    .mockReturnValueOnce([rollResults[1]])
                    .mockReturnValueOnce([rollResults[2]])
                    .mockReturnValueOnce([rollResults[3]]);
                (DiceLiteService as jest.Mock).mockImplementation(() => ({
                    roll: rollMock,
                }));

                // Act
                const result = GenerateSkillBackgroundStrategy['getSkills'](mockInteraction as ChatInputCommandInteraction);

                // Assert
                result.raisedSkills.forEach((raisedSkill) =>
                {
                    expect(result.loweredSkills).not.toContain(raisedSkill);
                });
                result.loweredSkills.forEach((loweredSkill) =>
                {
                    expect(result.raisedSkills).not.toContain(loweredSkill);
                });
            });
        });

        describe('when partial skills are provided', () =>
        {
            it('should generate 1 random raised skill when 1 raised skill is provided', () =>
            {
                // Arrange
                (mockInteraction.options!.getString as jest.Mock)
                    .mockReturnValueOnce(PtuSkill.Acrobatics)
                    .mockReturnValueOnce(null)
                    .mockReturnValueOnce(null)
                    .mockReturnValueOnce(PtuSkill.Combat)
                    .mockReturnValueOnce(PtuSkill.Command)
                    .mockReturnValueOnce(null);
                const rollMock = jest.fn()
                    .mockReturnValueOnce([1]);
                (DiceLiteService as jest.Mock).mockImplementation(() => ({
                    roll: rollMock,
                }));

                // Act
                const result = GenerateSkillBackgroundStrategy['getSkills'](mockInteraction as ChatInputCommandInteraction);

                // Assert
                expect(result.raisedSkills.length).toBe(2);
                expect(result.raisedSkills).toContain(PtuSkill.Acrobatics);
                expect(rollMock).toHaveBeenCalledTimes(1);
            });

            it('should generate 1 random lowered skill when 1 lowered skill is provided', () =>
            {
                // Arrange
                (mockInteraction.options!.getString as jest.Mock)
                    .mockReturnValueOnce(PtuSkill.Acrobatics)
                    .mockReturnValueOnce(PtuSkill.Athletics)
                    .mockReturnValueOnce(null)
                    .mockReturnValueOnce(PtuSkill.Combat)
                    .mockReturnValueOnce(null)
                    .mockReturnValueOnce(null);
                const rollMock = jest.fn()
                    .mockReturnValueOnce([1]);
                (DiceLiteService as jest.Mock).mockImplementation(() => ({
                    roll: rollMock,
                }));

                // Act
                const result = GenerateSkillBackgroundStrategy['getSkills'](mockInteraction as ChatInputCommandInteraction);

                // Assert
                expect(result.loweredSkills.length).toBe(2);
                expect(result.loweredSkills).toContain(PtuSkill.Combat);
                expect(rollMock).toHaveBeenCalledTimes(1);
            });

            it('should generate 1 random raised and lowered skill when 1 raised skill and 2 duplicate lowered skills are provided', () =>
            {
                // Arrange
                (mockInteraction.options!.getString as jest.Mock)
                    .mockReturnValueOnce(PtuSkill.Acrobatics)
                    .mockReturnValueOnce(null)
                    .mockReturnValueOnce(null)
                    .mockReturnValueOnce(PtuSkill.Combat)
                    .mockReturnValueOnce(PtuSkill.Combat)
                    .mockReturnValueOnce(null);
                const rollMock = jest.fn()
                    .mockReturnValueOnce([1])
                    .mockReturnValueOnce([2]);
                (DiceLiteService as jest.Mock).mockImplementation(() => ({
                    roll: rollMock,
                }));

                // Act
                const result = GenerateSkillBackgroundStrategy['getSkills'](mockInteraction as ChatInputCommandInteraction);

                // Assert
                expect(result.raisedSkills.length).toBe(2);
                expect(result.raisedSkills).toContain(PtuSkill.Acrobatics);
                expect(result.loweredSkills.length).toBe(2);
                expect(result.loweredSkills).toContain(PtuSkill.Combat);
                expect(rollMock).toHaveBeenCalledTimes(2);
            });

            it('should have all unique raised skills when generating random ones', () =>
            {
                // Arrange
                (mockInteraction.options!.getString as jest.Mock)
                    .mockReturnValueOnce(PtuSkill.Acrobatics)
                    .mockReturnValueOnce(null)
                    .mockReturnValueOnce(null)
                    .mockReturnValueOnce(PtuSkill.Combat)
                    .mockReturnValueOnce(PtuSkill.Command)
                    .mockReturnValueOnce(null);
                const rollMock = jest.fn()
                    .mockReturnValueOnce([1]);
                (DiceLiteService as jest.Mock).mockImplementation(() => ({
                    roll: rollMock,
                }));

                // Act
                const result = GenerateSkillBackgroundStrategy['getSkills'](mockInteraction as ChatInputCommandInteraction);

                // Assert
                const uniqueRaisedSkills = new Set(result.raisedSkills);
                expect(uniqueRaisedSkills.size).toBe(result.raisedSkills.length);
            });

            it('should have all unique lowered skills when generating random ones', () =>
            {
                // Arrange
                (mockInteraction.options!.getString as jest.Mock)
                    .mockReturnValueOnce(PtuSkill.Acrobatics)
                    .mockReturnValueOnce(PtuSkill.Athletics)
                    .mockReturnValueOnce(null)
                    .mockReturnValueOnce(PtuSkill.Combat)
                    .mockReturnValueOnce(null)
                    .mockReturnValueOnce(null);
                const rollMock = jest.fn()
                    .mockReturnValueOnce([1]);
                (DiceLiteService as jest.Mock).mockImplementation(() => ({
                    roll: rollMock,
                }));

                // Act
                const result = GenerateSkillBackgroundStrategy['getSkills'](mockInteraction as ChatInputCommandInteraction);

                // Assert
                const uniqueLoweredSkills = new Set(result.loweredSkills);
                expect(uniqueLoweredSkills.size).toBe(result.loweredSkills.length);
            });

            it('should have all valid raised skills when generating random ones', () =>
            {
                // Arrange
                (mockInteraction.options!.getString as jest.Mock)
                    .mockReturnValueOnce(PtuSkill.Acrobatics)
                    .mockReturnValueOnce(null)
                    .mockReturnValueOnce(null)
                    .mockReturnValueOnce(PtuSkill.Combat)
                    .mockReturnValueOnce(PtuSkill.Command)
                    .mockReturnValueOnce(null);
                const rollMock = jest.fn()
                    .mockReturnValueOnce([1]);
                (DiceLiteService as jest.Mock).mockImplementation(() => ({
                    roll: rollMock,
                }));

                // Act
                const result = GenerateSkillBackgroundStrategy['getSkills'](mockInteraction as ChatInputCommandInteraction);

                // Assert
                result.raisedSkills.forEach((skill) =>
                {
                    expect(skill).toBeDefined();
                    expect(skill).not.toBeNull();
                    expect(typeof skill).toBe('string');
                    expect(GenerateSkillBackgroundStrategy['validSkills']).toContain(skill);
                });
            });

            it('should have all valid lowered skills when generating random ones', () =>
            {
                // Arrange
                (mockInteraction.options!.getString as jest.Mock)
                    .mockReturnValueOnce(PtuSkill.Acrobatics)
                    .mockReturnValueOnce(PtuSkill.Athletics)
                    .mockReturnValueOnce(null)
                    .mockReturnValueOnce(PtuSkill.Combat)
                    .mockReturnValueOnce(null)
                    .mockReturnValueOnce(null);
                const rollMock = jest.fn()
                    .mockReturnValueOnce([1]);
                (DiceLiteService as jest.Mock).mockImplementation(() => ({
                    roll: rollMock,
                }));

                // Act
                const result = GenerateSkillBackgroundStrategy['getSkills'](mockInteraction as ChatInputCommandInteraction);

                // Assert
                result.loweredSkills.forEach((skill) =>
                {
                    expect(skill).toBeDefined();
                    expect(skill).not.toBeNull();
                    expect(typeof skill).toBe('string');
                    expect(GenerateSkillBackgroundStrategy['validSkills']).toContain(skill);
                });
            });

            it.each([
                ['different', [1, 2, 3]],
                ['the same', [1, 1, 1]],
            ])('should have no overlap between raised and lowered skills when generating random ones and roll results are %s', (_, rollResults) =>
            {
                // Arrange
                (mockInteraction.options!.getString as jest.Mock)
                    .mockReturnValueOnce(PtuSkill.Acrobatics)
                    .mockReturnValueOnce(null)
                    .mockReturnValueOnce(null)
                    .mockReturnValueOnce(null)
                    .mockReturnValueOnce(null)
                    .mockReturnValueOnce(null);
                const rollMock = jest.fn()
                    .mockReturnValueOnce([rollResults[0]])
                    .mockReturnValueOnce([rollResults[1]])
                    .mockReturnValueOnce([rollResults[2]]);
                (DiceLiteService as jest.Mock).mockImplementation(() => ({
                    roll: rollMock,
                }));

                // Act
                const result = GenerateSkillBackgroundStrategy['getSkills'](mockInteraction as ChatInputCommandInteraction);

                // Assert
                result.raisedSkills.forEach((raisedSkill) =>
                {
                    expect(result.loweredSkills).not.toContain(raisedSkill);
                });
                result.loweredSkills.forEach((loweredSkill) =>
                {
                    expect(result.raisedSkills).not.toContain(loweredSkill);
                });
            });
        });

        describe('when more than 2 skills are provided', () =>
        {
            it('should generate a third random lowered skill when 3 raised skills are provided', () =>
            {
                // Arrange
                (mockInteraction.options!.getString as jest.Mock)
                    .mockReturnValueOnce(PtuSkill.Acrobatics)
                    .mockReturnValueOnce(PtuSkill.Athletics)
                    .mockReturnValueOnce(PtuSkill.Charm)
                    .mockReturnValueOnce(PtuSkill.Combat)
                    .mockReturnValueOnce(PtuSkill.Command)
                    .mockReturnValueOnce(null);
                const rollMock = jest.fn()
                    .mockReturnValueOnce([1]);
                (DiceLiteService as jest.Mock).mockImplementation(() => ({
                    roll: rollMock,
                }));

                // Act
                const result = GenerateSkillBackgroundStrategy['getSkills'](mockInteraction as ChatInputCommandInteraction);

                // Assert
                expect(result.raisedSkills.length).toBe(3);
                expect(rollMock).toHaveBeenCalledTimes(1);
            });

            it('should generate a third random raised skill when 3 lowered skills are provided', () =>
            {
                // Arrange
                (mockInteraction.options!.getString as jest.Mock)
                    .mockReturnValueOnce(PtuSkill.Acrobatics)
                    .mockReturnValueOnce(PtuSkill.Athletics)
                    .mockReturnValueOnce(null)
                    .mockReturnValueOnce(PtuSkill.Combat)
                    .mockReturnValueOnce(PtuSkill.Command)
                    .mockReturnValueOnce(PtuSkill.Focus);
                const rollMock = jest.fn()
                    .mockReturnValueOnce([1]);
                (DiceLiteService as jest.Mock).mockImplementation(() => ({
                    roll: rollMock,
                }));

                // Act
                const result = GenerateSkillBackgroundStrategy['getSkills'](mockInteraction as ChatInputCommandInteraction);

                // Assert
                expect(result.loweredSkills.length).toBe(3);
                expect(rollMock).toHaveBeenCalledTimes(1);
            });
        });
    });
});
