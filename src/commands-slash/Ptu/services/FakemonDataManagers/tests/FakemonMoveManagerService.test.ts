/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
// ^ the above are giving a lot of false negatives for some reason, temporarily disabling

import { FakemonMovesStringSelectCustomIds } from '../../../components/fakemon/actionRowBuilders/moves/types';
import { PtuFakemonCollection } from '../../../dal/models/PtuFakemonCollection';
import { PtuFakemonPseudoCache } from '../../../dal/PtuFakemonPseudoCache';
import { createPtuFakemonCollectionData } from '../../../fakes/PtuFakemonCollection.fakes';
import { PokemonType } from '../../../types/pokemon';
import { FakemonInteractionManagerPage } from '../../FakemonInteractionManagerService/types';
import { FakemonMoveManagerService } from '../FakemonMoveManagerService';
import { shuffleArrayTimes } from './util';

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

const getTestMoves = (): Record<
    'tackle' | 'quickAttack' | 'return' | 'ember' | 'fireSpin' | 'flameBurst' | 'waterGun' | 'aquaJet' | 'bubble' | 'waterPulse',
    PtuFakemonCollection['moveList']['levelUp'][number]
> =>
{
    return {
        // Normal moves
        tackle: {
            move: 'Tackle',
            type: PokemonType.Normal,
            level: 1,
        },
        quickAttack: {
            move: 'Quick Attack',
            type: PokemonType.Normal,
            level: 7,
        },
        return: {
            move: 'Return',
            type: PokemonType.Normal,
            level: 10,
        },

        // Fire moves
        ember: {
            move: 'Ember',
            type: PokemonType.Fire,
            level: 1,
        },
        fireSpin: {
            move: 'Fire Spin',
            type: PokemonType.Fire,
            level: 7,
        },
        flameBurst: {
            move: 'Flame Burst',
            type: PokemonType.Fire,
            level: 10,
        },

        // Water moves
        waterGun: {
            move: 'Water Gun',
            type: PokemonType.Water,
            level: 7,
        },
        aquaJet: {
            move: 'Aqua Jet',
            type: PokemonType.Water,
            level: 10,
        },
        bubble: {
            move: 'Bubble',
            type: PokemonType.Water,
            level: 10,
        },
        waterPulse: {
            move: 'Water Pulse',
            type: PokemonType.Water,
            level: 10,
        },
    };
};

const movesMap = getTestMoves();

describe(`class: ${FakemonMoveManagerService.name}`, () =>
{
    beforeEach(() =>
    {
        jest.clearAllMocks();
    });

    describe('constants', () =>
    {
        it('should have the correct constants', () =>
        {
            expect(FakemonMoveManagerService.MAX_LEVEL_UP_MOVES).toBe(35);
            expect(FakemonMoveManagerService.MAX_EGG_MOVES).toBe(20);
            expect(FakemonMoveManagerService.MAX_TUTOR_AND_TMHM_MOVES).toBe(75);
            expect(FakemonMoveManagerService.MAX_MOVE_NAME_LENGTH).toBe(100);
        });
    });

    describe(`method: ${FakemonMoveManagerService.addLevelUpMove.name}`, () =>
    {
        const defaultArgs: Parameters<typeof FakemonMoveManagerService['addLevelUpMove']>[0] = {
            messageId: 'messageId',
            fakemon: createPtuFakemonCollectionData(),
            move: movesMap.tackle,
        };

        it('should add the level up move to the fakemon', async () =>
        {
            // Arrange
            const expectedResult = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                .mockResolvedValue(expectedResult);

            // Act
            const result = await FakemonMoveManagerService['addLevelUpMove']({
                ...defaultArgs,
                fakemon: {
                    ...defaultArgs.fakemon,
                    moveList: {
                        ...defaultArgs.fakemon.moveList,
                        levelUp: [movesMap.ember, movesMap.waterPulse],
                    },
                } as typeof defaultArgs.fakemon,
            });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(updateSpy).toHaveBeenCalledWith(
                defaultArgs.messageId,
                { id: defaultArgs.fakemon.id },
                {
                    moveList: {
                        ...defaultArgs.fakemon.moveList,
                        levelUp: [movesMap.ember, movesMap.tackle, movesMap.waterPulse],
                    },
                },
            );
        });

        it('should throw error if move name is empty', async () =>
        {
            // Act & Assert
            await expect(
                FakemonMoveManagerService['addLevelUpMove']({
                    ...defaultArgs,
                    move: { ...defaultArgs.move, move: '' },
                }),
            ).rejects.toThrow('Move name cannot be empty');
        });

        it('should throw error if move type is invalid', async () =>
        {
            // Act & Assert
            await expect(
                FakemonMoveManagerService['addLevelUpMove']({
                    ...defaultArgs,
                    move: { ...defaultArgs.move, type: 'InvalidType' as PokemonType },
                }),
            ).rejects.toThrow('Move type is invalid');
        });

        it('should throw error if move level is negative', async () =>
        {
            // Act & Assert
            await expect(
                FakemonMoveManagerService['addLevelUpMove']({
                    ...defaultArgs,
                    move: { ...defaultArgs.move, level: -1 },
                }),
            ).rejects.toThrow('Move level cannot be negative');
        });

        it('should throw error if move level is greater than 100', async () =>
        {
            // Act & Assert
            await expect(
                FakemonMoveManagerService['addLevelUpMove']({
                    ...defaultArgs,
                    move: { ...defaultArgs.move, level: 101 },
                }),
            ).rejects.toThrow('Move level cannot be greater than 100');
        });

        it(`should throw error if move name is greater than ${FakemonMoveManagerService.MAX_MOVE_NAME_LENGTH} characters`, async () =>
        {
            // Act & Assert
            await expect(
                FakemonMoveManagerService['addLevelUpMove']({
                    ...defaultArgs,
                    move: { ...defaultArgs.move, move: 'a'.repeat(FakemonMoveManagerService.MAX_MOVE_NAME_LENGTH + 1) },
                }),
            ).rejects.toThrow(`Move name cannot be longer than ${FakemonMoveManagerService.MAX_MOVE_NAME_LENGTH} characters`);
        });

        it('should throw error if fakemon has too many moves', async () =>
        {
            // Act & Assert
            await expect(
                FakemonMoveManagerService['addLevelUpMove']({
                    ...defaultArgs,
                    fakemon: {
                        ...defaultArgs.fakemon,
                        moveList: {
                            ...defaultArgs.fakemon.moveList,
                            levelUp: Array.from({ length: FakemonMoveManagerService.MAX_LEVEL_UP_MOVES }, () => defaultArgs.move),
                        },
                    } as typeof defaultArgs.fakemon,
                }),
            ).rejects.toThrow(`Fakemon cannot have more than ${FakemonMoveManagerService.MAX_LEVEL_UP_MOVES} moves`);
        });

        it(`should throw error if there's exact duplicate moves`, async () =>
        {
            // Act & Assert
            await expect(
                FakemonMoveManagerService['addLevelUpMove']({
                    ...defaultArgs,
                    fakemon: {
                        ...defaultArgs.fakemon,
                        moveList: {
                            ...defaultArgs.fakemon.moveList,
                            levelUp: [defaultArgs.move],
                        },
                    } as typeof defaultArgs.fakemon,
                }),
            ).rejects.toThrow(`Fakemon cannot have duplicate moves: ${defaultArgs.move.move}`);
        });

        it(`should throw error if there's a duplicate move name`, async () =>
        {
            // Act & Assert
            await expect(
                FakemonMoveManagerService['addLevelUpMove']({
                    ...defaultArgs,
                    fakemon: {
                        ...defaultArgs.fakemon,
                        moveList: {
                            ...defaultArgs.fakemon.moveList,
                            levelUp: [{ ...defaultArgs.move, level: 100, type: PokemonType.Ghost }],
                        },
                    } as typeof defaultArgs.fakemon,
                }),
            ).rejects.toThrow(`Fakemon cannot have duplicate moves: ${defaultArgs.move.move}`);
        });
    });

    describe(`method: ${FakemonMoveManagerService.editLevelUpMove.name}`, () =>
    {
        const defaultArgs: Parameters<typeof FakemonMoveManagerService['editLevelUpMove']>[0] = {
            messageId: 'messageId',
            fakemon: createPtuFakemonCollectionData(),
            oldMove: { ...movesMap.tackle, move: 'Takle' },
            newMove: movesMap.tackle,
        };

        it('should edit the level up move on the fakemon', async () =>
        {
            // Arrange
            const expectedResult = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                .mockResolvedValue(expectedResult);

            // Act
            const result = await FakemonMoveManagerService['editLevelUpMove']({
                ...defaultArgs,
                fakemon: {
                    ...defaultArgs.fakemon,
                    moveList: {
                        ...defaultArgs.fakemon.moveList,
                        levelUp: [movesMap.ember, defaultArgs.oldMove, movesMap.waterPulse],
                    },
                } as typeof defaultArgs.fakemon,
            });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(updateSpy).toHaveBeenCalledWith(
                defaultArgs.messageId,
                { id: defaultArgs.fakemon.id },
                {
                    moveList: {
                        ...defaultArgs.fakemon.moveList,
                        levelUp: [movesMap.ember, movesMap.tackle, movesMap.waterPulse],
                    },
                },
            );
        });

        it('should sort the level up moves after editing successfully', async () =>
        {
            // Arrange
            const oldMove: typeof defaultArgs.oldMove = {
                ...movesMap.waterPulse,
                move: 'Watur Pulc',
                type: PokemonType.Fire,
            };
            const expectedResult = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                .mockResolvedValue(expectedResult);

            // Act
            const result = await FakemonMoveManagerService['editLevelUpMove']({
                ...defaultArgs,
                fakemon: {
                    ...defaultArgs.fakemon,
                    moveList: {
                        ...defaultArgs.fakemon.moveList,
                        levelUp: [movesMap.ember, oldMove, movesMap.tackle],
                    },
                } as typeof defaultArgs.fakemon,
                oldMove,
                newMove: movesMap.waterPulse,
            });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(updateSpy).toHaveBeenCalledWith(
                defaultArgs.messageId,
                { id: defaultArgs.fakemon.id },
                {
                    moveList: {
                        ...defaultArgs.fakemon.moveList,
                        levelUp: [movesMap.ember, movesMap.tackle, movesMap.waterPulse],
                    },
                },
            );
        });

        it('should throw error if old move name is empty', async () =>
        {
            // Act & Assert
            await expect(
                FakemonMoveManagerService['editLevelUpMove']({
                    ...defaultArgs,
                    oldMove: { ...defaultArgs.oldMove, move: '' },
                }),
            ).rejects.toThrow('Invalid old move: Move name cannot be empty');
        });

        it('should throw error if new move name is empty', async () =>
        {
            // Act & Assert
            await expect(
                FakemonMoveManagerService['editLevelUpMove']({
                    ...defaultArgs,
                    newMove: { ...defaultArgs.newMove, move: '' },
                }),
            ).rejects.toThrow('Invalid new move: Move name cannot be empty');
        });

        it('should throw error if old move type is invalid', async () =>
        {
            // Act & Assert
            await expect(
                FakemonMoveManagerService['editLevelUpMove']({
                    ...defaultArgs,
                    oldMove: { ...defaultArgs.oldMove, type: 'InvalidType' as PokemonType },
                }),
            ).rejects.toThrow('Invalid old move: Move type is invalid');
        });

        it('should throw error if new move type is invalid', async () =>
        {
            // Act & Assert
            await expect(
                FakemonMoveManagerService['editLevelUpMove']({
                    ...defaultArgs,
                    newMove: { ...defaultArgs.newMove, type: 'InvalidType' as PokemonType },
                }),
            ).rejects.toThrow('Invalid new move: Move type is invalid');
        });

        it('should throw error if old move level is negative', async () =>
        {
            // Act & Assert
            await expect(
                FakemonMoveManagerService['editLevelUpMove']({
                    ...defaultArgs,
                    oldMove: { ...defaultArgs.oldMove, level: -1 },
                }),
            ).rejects.toThrow('Invalid old move: Move level cannot be negative');
        });

        it('should throw error if new move level is negative', async () =>
        {
            // Act & Assert
            await expect(
                FakemonMoveManagerService['editLevelUpMove']({
                    ...defaultArgs,
                    newMove: { ...defaultArgs.newMove, level: -1 },
                }),
            ).rejects.toThrow('Invalid new move: Move level cannot be negative');
        });

        it('should throw error if old move level is greater than 100', async () =>
        {
            // Act & Assert
            await expect(
                FakemonMoveManagerService['editLevelUpMove']({
                    ...defaultArgs,
                    oldMove: { ...defaultArgs.oldMove, level: 101 },
                }),
            ).rejects.toThrow('Invalid old move: Move level cannot be greater than 100');
        });

        it('should throw error if new move level is greater than 100', async () =>
        {
            // Act & Assert
            await expect(
                FakemonMoveManagerService['editLevelUpMove']({
                    ...defaultArgs,
                    newMove: { ...defaultArgs.newMove, level: 101 },
                }),
            ).rejects.toThrow('Invalid new move: Move level cannot be greater than 100');
        });

        it(`should throw error if old move name is greater than ${FakemonMoveManagerService.MAX_MOVE_NAME_LENGTH} characters`, async () =>
        {
            // Act & Assert
            await expect(
                FakemonMoveManagerService['editLevelUpMove']({
                    ...defaultArgs,
                    oldMove: { ...defaultArgs.oldMove, move: 'a'.repeat(101) },
                }),
            ).rejects.toThrow('Invalid old move: Move name cannot be longer than 100 characters');
        });

        it(`should throw error if new move name is greater than ${FakemonMoveManagerService.MAX_MOVE_NAME_LENGTH} characters`, async () =>
        {
            // Act & Assert
            await expect(
                FakemonMoveManagerService['editLevelUpMove']({
                    ...defaultArgs,
                    newMove: { ...defaultArgs.newMove, move: 'a'.repeat(101) },
                }),
            ).rejects.toThrow('Invalid new move: Move name cannot be longer than 100 characters');
        });

        it(`should throw error if new move name is a duplicate of an existing move name that isn't old move`, async () =>
        {
            // Act & Assert
            await expect(
                FakemonMoveManagerService['editLevelUpMove']({
                    ...defaultArgs,
                    fakemon: {
                        ...defaultArgs.fakemon,
                        moveList: {
                            ...defaultArgs.fakemon.moveList,
                            levelUp: [defaultArgs.oldMove, movesMap.ember],
                        },
                    } as typeof defaultArgs.fakemon,
                    newMove: { ...movesMap.ember, level: 100 },
                }),
            ).rejects.toThrow(`Fakemon cannot have duplicate moves: ${movesMap.ember.move}`);
        });
    });

    describe(`method: ${FakemonMoveManagerService.addNonLevelUpMoves.name}`, () =>
    {
        const defaultArgs: Parameters<typeof FakemonMoveManagerService['addNonLevelUpMoves']>[0] = {
            messageId: 'messageId',
            fakemon: createPtuFakemonCollectionData(),
            moveListToAddTo: 'eggMoves',
            names: [movesMap.aquaJet.move, movesMap.return.move],
        };

        it('should add the egg moves to the fakemon', async () =>
        {
            // Arrange
            const expectedResult = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                .mockResolvedValue(expectedResult);

            // Act
            const result = await FakemonMoveManagerService['addNonLevelUpMoves']({
                ...defaultArgs,
                moveListToAddTo: 'eggMoves',
                fakemon: {
                    ...defaultArgs.fakemon,
                    moveList: {
                        ...defaultArgs.fakemon.moveList,
                        eggMoves: [movesMap.ember.move, movesMap.tackle.move, movesMap.waterPulse.move],
                    },
                } as typeof defaultArgs.fakemon,
            });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(updateSpy).toHaveBeenCalledWith(
                defaultArgs.messageId,
                { id: defaultArgs.fakemon.id },
                {
                    moveList: {
                        ...defaultArgs.fakemon.moveList,
                        eggMoves: [
                            movesMap.aquaJet.move,
                            movesMap.ember.move,
                            movesMap.return.move,
                            movesMap.tackle.move,
                            movesMap.waterPulse.move,
                        ],
                    },
                },
            );
        });

        it('should add the tm/hm moves to the fakemon', async () =>
        {
            // Arrange
            const expectedResult = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                .mockResolvedValue(expectedResult);

            // Act
            const result = await FakemonMoveManagerService['addNonLevelUpMoves']({
                ...defaultArgs,
                moveListToAddTo: 'tmHm',
                fakemon: {
                    ...defaultArgs.fakemon,
                    moveList: {
                        ...defaultArgs.fakemon.moveList,
                        tmHm: [movesMap.ember.move, movesMap.tackle.move, movesMap.waterPulse.move],
                    },
                } as typeof defaultArgs.fakemon,
            });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(updateSpy).toHaveBeenCalledWith(
                defaultArgs.messageId,
                { id: defaultArgs.fakemon.id },
                {
                    moveList: {
                        ...defaultArgs.fakemon.moveList,
                        tmHm: [
                            movesMap.aquaJet.move,
                            movesMap.ember.move,
                            movesMap.return.move,
                            movesMap.tackle.move,
                            movesMap.waterPulse.move,
                        ],
                    },
                },
            );
        });

        it('should add the tutor moves to the fakemon', async () =>
        {
            // Arrange
            const expectedResult = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                .mockResolvedValue(expectedResult);

            // Act
            const result = await FakemonMoveManagerService['addNonLevelUpMoves']({
                ...defaultArgs,
                moveListToAddTo: 'tutorMoves',
                fakemon: {
                    ...defaultArgs.fakemon,
                    moveList: {
                        ...defaultArgs.fakemon.moveList,
                        tutorMoves: [movesMap.ember.move, movesMap.tackle.move, movesMap.waterPulse.move],
                    },
                } as typeof defaultArgs.fakemon,
            });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(updateSpy).toHaveBeenCalledWith(
                defaultArgs.messageId,
                { id: defaultArgs.fakemon.id },
                {
                    moveList: {
                        ...defaultArgs.fakemon.moveList,
                        tutorMoves: [
                            movesMap.aquaJet.move,
                            movesMap.ember.move,
                            movesMap.return.move,
                            movesMap.tackle.move,
                            movesMap.waterPulse.move,
                        ],
                    },
                },
            );
        });

        it('should exit early if moveListToAddTo is invalid', async () =>
        {
            // Arrange
            const expectedResult = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                .mockResolvedValue(expectedResult);

            // Act
            const result = await FakemonMoveManagerService['addNonLevelUpMoves']({
                ...defaultArgs,
                moveListToAddTo: 'INVALID' as 'eggMoves',
            });

            // Assert
            expect(result).toEqual(result);
            expect(updateSpy).not.toHaveBeenCalled();
        });

        it(`should throw error if one of the move's names is empty`, async () =>
        {
            // Act & Assert
            await expect(
                FakemonMoveManagerService['addNonLevelUpMoves']({
                    ...defaultArgs,
                    names: [movesMap.aquaJet.move, movesMap.return.move, ''],
                }),
            ).rejects.toThrow('Move name cannot be empty');
        });

        it(`should throw error if move name is greater than ${FakemonMoveManagerService.MAX_MOVE_NAME_LENGTH} characters`, async () =>
        {
            // Act & Assert
            await expect(
                FakemonMoveManagerService['addNonLevelUpMoves']({
                    ...defaultArgs,
                    names: [movesMap.aquaJet.move, movesMap.return.move, 'a'.repeat(FakemonMoveManagerService.MAX_MOVE_NAME_LENGTH + 1)],
                }),
            ).rejects.toThrow(`Move name cannot be longer than ${FakemonMoveManagerService.MAX_MOVE_NAME_LENGTH} characters`);
        });

        it('should throw error if fakemon has too many egg moves', async () =>
        {
            // Act & Assert
            await expect(
                FakemonMoveManagerService['addNonLevelUpMoves']({
                    ...defaultArgs,
                    moveListToAddTo: 'eggMoves',
                    fakemon: {
                        ...defaultArgs.fakemon,
                        moveList: {
                            ...defaultArgs.fakemon.moveList,
                            eggMoves: Array.from({ length: FakemonMoveManagerService.MAX_EGG_MOVES }, (_, index) => `${index}`),
                        },
                    } as typeof defaultArgs.fakemon,
                    names: [movesMap.return.move],
                }),
            ).rejects.toThrow(`Fakemon cannot have more than ${FakemonMoveManagerService.MAX_EGG_MOVES} egg moves`);
        });

        it('should throw error if fakemon has too many tm/hm moves', async () =>
        {
            // Act & Assert
            await expect(
                FakemonMoveManagerService['addNonLevelUpMoves']({
                    ...defaultArgs,
                    moveListToAddTo: 'tmHm',
                    fakemon: {
                        ...defaultArgs.fakemon,
                        moveList: {
                            ...defaultArgs.fakemon.moveList,
                            tmHm: Array.from({ length: FakemonMoveManagerService.MAX_TUTOR_AND_TMHM_MOVES }, (_, index) => `${index}`),
                        },
                    } as typeof defaultArgs.fakemon,
                    names: [movesMap.return.move],
                }),
            ).rejects.toThrow(`Fakemon cannot have more than ${FakemonMoveManagerService.MAX_TUTOR_AND_TMHM_MOVES} tm/hm moves`);
        });

        it('should throw error if fakemon has too many tutor moves', async () =>
        {
            // Act & Assert
            await expect(
                FakemonMoveManagerService['addNonLevelUpMoves']({
                    ...defaultArgs,
                    moveListToAddTo: 'tutorMoves',
                    fakemon: {
                        ...defaultArgs.fakemon,
                        moveList: {
                            ...defaultArgs.fakemon.moveList,
                            tutorMoves: Array.from({ length: FakemonMoveManagerService.MAX_TUTOR_AND_TMHM_MOVES }, (_, index) => `${index}`),
                        },
                    } as typeof defaultArgs.fakemon,
                    names: [movesMap.return.move],
                }),
            ).rejects.toThrow(`Fakemon cannot have more than ${FakemonMoveManagerService.MAX_TUTOR_AND_TMHM_MOVES} tutor moves`);
        });
    });

    describe(`method: ${FakemonMoveManagerService.removeMoves.name}`, () =>
    {
        const fakemon = createPtuFakemonCollectionData();
        const defaultArgs: Parameters<typeof FakemonMoveManagerService['removeMoves']>[0] = {
            messageId: 'messageId',
            fakemon: {
                ...fakemon,
                moveList: {
                    levelUp: [movesMap.ember, movesMap.return, movesMap.aquaJet, movesMap.waterPulse],
                    eggMoves: [movesMap.ember.move, movesMap.return.move, movesMap.aquaJet.move, movesMap.waterPulse.move],
                    tmHm: [movesMap.ember.move, movesMap.return.move, movesMap.aquaJet.move, movesMap.waterPulse.move],
                    tutorMoves: [movesMap.ember.move, movesMap.return.move, movesMap.aquaJet.move, movesMap.waterPulse.move],
                },
            } as typeof defaultArgs.fakemon,
            moveListToRemoveFrom: 'eggMoves',
            names: [movesMap.aquaJet.move, movesMap.return.move],
        };
        const expectedRemainingMoves = [movesMap.ember, movesMap.waterPulse];

        it('should remove level up moves', async () =>
        {
            // Arrange
            const expectedResult = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                .mockResolvedValue(expectedResult);

            // Act
            const result = await FakemonMoveManagerService['removeMoves']({
                ...defaultArgs,
                moveListToRemoveFrom: 'levelUp',
            });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(updateSpy).toHaveBeenCalledWith(
                defaultArgs.messageId,
                { id: defaultArgs.fakemon.id },
                {
                    moveList: {
                        ...defaultArgs.fakemon.moveList,
                        levelUp: expectedRemainingMoves,
                    },
                },
            );
        });

        it('should remove egg moves', async () =>
        {
            // Arrange
            const expectedResult = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                .mockResolvedValue(expectedResult);

            // Act
            const result = await FakemonMoveManagerService['removeMoves']({
                ...defaultArgs,
                moveListToRemoveFrom: 'eggMoves',
            });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(updateSpy).toHaveBeenCalledWith(
                defaultArgs.messageId,
                { id: defaultArgs.fakemon.id },
                {
                    moveList: {
                        ...defaultArgs.fakemon.moveList,
                        eggMoves: expectedRemainingMoves.map(move => move.move),
                    },
                },
            );
        });

        it('should remove tm/hm moves', async () =>
        {
            // Arrange
            const expectedResult = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                .mockResolvedValue(expectedResult);

            // Act
            const result = await FakemonMoveManagerService['removeMoves']({
                ...defaultArgs,
                moveListToRemoveFrom: 'tmHm',
            });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(updateSpy).toHaveBeenCalledWith(
                defaultArgs.messageId,
                { id: defaultArgs.fakemon.id },
                {
                    moveList: {
                        ...defaultArgs.fakemon.moveList,
                        tmHm: expectedRemainingMoves.map(move => move.move),
                    },
                },
            );
        });

        it('should remove tutor moves', async () =>
        {
            // Arrange
            const expectedResult = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                .mockResolvedValue(expectedResult);

            // Act
            const result = await FakemonMoveManagerService['removeMoves']({
                ...defaultArgs,
                moveListToRemoveFrom: 'tutorMoves',
            });

            // Assert
            expect(result).toEqual(expectedResult);
            expect(updateSpy).toHaveBeenCalledWith(
                defaultArgs.messageId,
                { id: defaultArgs.fakemon.id },
                {
                    moveList: {
                        ...defaultArgs.fakemon.moveList,
                        tutorMoves: expectedRemainingMoves.map(move => move.move),
                    },
                },
            );
        });

        it('should exit early if moveListToRemoveFrom is invalid', async () =>
        {
            // Arrange
            const expectedResult = createPtuFakemonCollectionData();
            const updateSpy = jest.spyOn(PtuFakemonPseudoCache, 'update')
                .mockResolvedValue(expectedResult);

            // Act
            const result = await FakemonMoveManagerService['removeMoves']({
                ...defaultArgs,
                moveListToRemoveFrom: 'INVALID' as 'eggMoves',
            });

            // Assert
            expect(result).toEqual(result);
            expect(updateSpy).not.toHaveBeenCalled();
        });

        it(`should throw error if one of the move's names is empty`, async () =>
        {
            // Act & Assert
            await expect(
                FakemonMoveManagerService['removeMoves']({
                    ...defaultArgs,
                    names: [defaultArgs.names[0], defaultArgs.names[1], ''],
                }),
            ).rejects.toThrow('Move name cannot be empty');
        });

        it.each([
            'levelUp',
            'eggMoves',
            'tutorMoves',
            'tmHm',
        ] as const)(`should throw error if fakemon cannot remove any provided %s moves because they're missing`, async (moveListToRemoveFrom) =>
        {
            // Arrange
            const names = ['INVALID1', 'INVALID2', 'INVALID3'];

            // Act & Assert
            await expect(
                FakemonMoveManagerService['removeMoves']({
                    ...defaultArgs,
                    moveListToRemoveFrom,
                    names: ['INVALID1', 'INVALID2', 'INVALID3'],
                }),
            ).rejects.toThrow(`Fakemon does not have ${moveListToRemoveFrom} moves called ${names.join(', ')}`);
        });
    });

    describe(`method: ${FakemonMoveManagerService['validateLevelUpMove'].name}`, () =>
    {
        let defaultArgs: Parameters<typeof FakemonMoveManagerService['validateLevelUpMove']>[0];

        beforeEach(() =>
        {
            defaultArgs = {
                move: 'Tackle',
                type: PokemonType.Normal,
                level: 1,
            };
        });

        it('should throw error if move name is empty', () =>
        {
            // Act & Assert
            expect(() =>
            {
                FakemonMoveManagerService['validateLevelUpMove']({
                    ...defaultArgs,
                    move: '',
                });
            }).toThrow('Move name cannot be empty');
        });

        it('should throw error if move type is invalid', () =>
        {
            // Act & Assert
            expect(() =>
            {
                FakemonMoveManagerService['validateLevelUpMove']({
                    ...defaultArgs,
                    type: 'INVALID',
                });
            }).toThrow('Move type is invalid');
        });

        it('should throw error if move level is negative', () =>
        {
            // Act & Assert
            expect(() =>
            {
                FakemonMoveManagerService['validateLevelUpMove']({
                    ...defaultArgs,
                    level: -1,
                });
            }).toThrow('Move level cannot be negative');
        });

        it('should throw error if move level is greater than 100', () =>
        {
            // Act & Assert
            expect(() =>
            {
                FakemonMoveManagerService['validateLevelUpMove']({
                    ...defaultArgs,
                    level: 101,
                });
            }).toThrow('Move level cannot be greater than 100');
        });

        it(`should throw error if move name is longer than ${FakemonMoveManagerService.MAX_MOVE_NAME_LENGTH} characters`, () =>
        {
            // Arrange
            const move = Array.from(({ length: FakemonMoveManagerService.MAX_MOVE_NAME_LENGTH + 1 }), () => 'a').join('');

            // Act & Assert
            expect(() =>
            {
                FakemonMoveManagerService['validateLevelUpMove']({
                    ...defaultArgs,
                    move,
                });
            }).toThrow(`Move name cannot be longer than ${FakemonMoveManagerService.MAX_MOVE_NAME_LENGTH} characters`);
        });
    });

    describe(`method: ${FakemonMoveManagerService['sortLevelUpMoves'].name}`, () =>
    {
        it.each([
            ['1, 7, 10', [movesMap.tackle, movesMap.quickAttack, movesMap.return]],
            ['1, 10, 7', [movesMap.tackle, movesMap.return, movesMap.quickAttack]],
            ['7, 1, 10', [movesMap.quickAttack, movesMap.tackle, movesMap.return]],
            ['7, 10, 1', [movesMap.quickAttack, movesMap.return, movesMap.tackle]],
            ['10, 1, 7', [movesMap.return, movesMap.tackle, movesMap.quickAttack]],
            ['10, 7, 1', [movesMap.return, movesMap.quickAttack, movesMap.tackle]],
        ])(`should sort by level first: %s -> 1, 7, 10`, (_, moves) =>
        {
            // Act
            const result = FakemonMoveManagerService['sortLevelUpMoves'](moves);

            // Assert
            expect(result).toEqual([movesMap.tackle, movesMap.quickAttack, movesMap.return]);
        });

        it.each([
            ['fire, normal, water', [movesMap.fireSpin, movesMap.quickAttack, movesMap.waterGun]],
            ['fire, water, normal', [movesMap.fireSpin, movesMap.waterGun, movesMap.quickAttack]],
            ['normal, fire, water', [movesMap.quickAttack, movesMap.fireSpin, movesMap.waterGun]],
            ['normal, water, fire', [movesMap.quickAttack, movesMap.waterGun, movesMap.fireSpin]],
            ['water, fire, normal', [movesMap.waterGun, movesMap.fireSpin, movesMap.quickAttack]],
            ['water, normal, fire', [movesMap.waterGun, movesMap.quickAttack, movesMap.fireSpin]],
        ])('should sort type second: %s -> fire, normal, water', (_, moves) =>
        {
            // Act
            const result = FakemonMoveManagerService['sortLevelUpMoves'](moves);

            // Assert
            expect(result).toEqual([movesMap.fireSpin, movesMap.quickAttack, movesMap.waterGun]);
        });

        it.each([
            ['aqua jet, bubble, water pulse', [movesMap.aquaJet, movesMap.bubble, movesMap.waterPulse]],
            ['aqua jet, water pulse, bubble', [movesMap.aquaJet, movesMap.waterPulse, movesMap.bubble]],
            ['bubble, aqua jet, water pulse', [movesMap.bubble, movesMap.aquaJet, movesMap.waterPulse]],
            ['bubble, water pulse, aqua jet', [movesMap.bubble, movesMap.waterPulse, movesMap.aquaJet]],
            ['water pulse, aqua jet, bubble', [movesMap.waterPulse, movesMap.aquaJet, movesMap.bubble]],
            ['water pulse, bubble, aqua jet', [movesMap.waterPulse, movesMap.bubble, movesMap.aquaJet]],
        ])('should sort by move name third: %s -> aqua jet, bubble, water pulse', (_, moves) =>
        {
            // Act
            const result = FakemonMoveManagerService['sortLevelUpMoves'](moves);

            // Assert
            expect(result).toEqual([movesMap.aquaJet, movesMap.bubble, movesMap.waterPulse]);
        });

        const allPossibleCombinations = [1, 2, 3].reduce<PtuFakemonCollection['moveList']['levelUp']>((acc1, level) =>
        {
            const cur1 = Object.values(PokemonType).sort().reduce<PtuFakemonCollection['moveList']['levelUp']>((acc2, type) =>
            {
                const cur2 = ['a', 'b', 'c'].reduce<PtuFakemonCollection['moveList']['levelUp']>((acc3, move) =>
                {
                    acc3.push({
                        level,
                        move,
                        type,
                    });
                    return acc3;
                }, []);

                acc2.push(...cur2);
                return acc2;
            }, []);

            acc1.push(...cur1);
            return acc1;
        }, []);

        // Ensure random combinations are always sorted in the same way
        [
            allPossibleCombinations,
            ...shuffleArrayTimes(allPossibleCombinations, 49),
        ].forEach((moves, index) =>
        {
            it(`should sort level up moves by level, type, then name randomized #${index + 1}`, () =>
            {
                // Act
                const result = FakemonMoveManagerService['sortLevelUpMoves'](moves);

                // Assert
                expect(result).toEqual(allPossibleCombinations);
            });
        });

        it('should successfully sort level up moves with some non-integer levels', () =>
        {
            // Arrange
            const moves = [
                { ...movesMap.tackle, level: 'A' },
                { ...movesMap.quickAttack, level: 1 },
                { ...movesMap.return, level: 'B' },
                {
                    move: 'Mega Punch',
                    type: PokemonType.Normal,
                    level: 'Evo',
                },
            ];

            // Act
            const result = FakemonMoveManagerService['sortLevelUpMoves'](moves);

            // Assert
            expect(result).toEqual([moves[3], moves[2], moves[0], moves[1]]);
        });

        it('should successfully sort level up moves with all non-integer levels and one different type', () =>
        {
            // Arrange
            const moves = [
                { ...movesMap.tackle, level: 'D' },
                { ...movesMap.quickAttack, level: 'B' },
                { ...movesMap.return, level: 'C' },
                { ...movesMap.ember, level: 'A' },
            ];

            // Act
            const result = FakemonMoveManagerService['sortLevelUpMoves'](moves);

            // Assert
            expect(result).toEqual([moves[3], moves[1], moves[2], moves[0]]);
        });

        it('should return empty array if empty array is provided', () =>
        {
            // Act
            const result = FakemonMoveManagerService['sortLevelUpMoves']([]);

            // Assert
            expect(result).toEqual([]);
        });
    });

    describe(`method: ${FakemonMoveManagerService.getMoveListByCustomId.name}`, () =>
    {
        const defaultFakemon: Parameters<typeof FakemonMoveManagerService['getMoveListByCustomId']>[1] = {
            moveList: {
                eggMoves: ['Egg 1', 'Egg 2', 'Egg 3'],
                tmHm: ['Tm 1', 'Tm 2', 'Tm 3'],
                tutorMoves: ['Tutor 1', 'Tutor 2', 'Tutor 3'],
                levelUp: [/* Leave empty, unnecessary for testing this method */],
            },
        };

        it.each([
            [FakemonMovesStringSelectCustomIds.RemoveEggMoves, defaultFakemon.moveList.eggMoves],
            [FakemonMovesStringSelectCustomIds.RemoveTmHmMoves, defaultFakemon.moveList.tmHm],
            [FakemonMovesStringSelectCustomIds.RemoveTutorMoves, defaultFakemon.moveList.tutorMoves],
        ] as const)('should get move list by custom id: %s', (customId, expectedResult) =>
        {
            // Act
            const result = FakemonMoveManagerService.getMoveListByCustomId(customId, defaultFakemon);

            // Assert
            expect(result).toEqual(expectedResult);
        });

        it('should throw for invalid custom id', () =>
        {
            // Act & Assert
            expect(() =>
                FakemonMoveManagerService.getMoveListByCustomId('INVALID' as FakemonMovesStringSelectCustomIds.RemoveEggMoves, defaultFakemon),
            ).toThrow('Unhandled customId: INVALID');
        });
    });

    describe(`method: ${FakemonMoveManagerService.getInteractionPageByMoveListKey.name}`, () =>
    {
        it.each([
            ['eggMoves', FakemonInteractionManagerPage.EggMoves],
            ['tmHm', FakemonInteractionManagerPage.TmHmMoves],
            ['tutorMoves', FakemonInteractionManagerPage.TutorMoves],
        ] as const)('should get interaction page by move list key: %s', (moveListKey, expectedResult) =>
        {
            // Act
            const result = FakemonMoveManagerService.getInteractionPageByMoveListKey(moveListKey);

            // Assert
            expect(result).toEqual(expectedResult);
        });

        it('should throw for invalid move list key', () =>
        {
            // Act & Assert
            expect(() =>
                FakemonMoveManagerService.getInteractionPageByMoveListKey('INVALID' as 'eggMoves' | 'tmHm' | 'tutorMoves'),
            ).toThrow('Unhandled moveListKey: INVALID');
        });
    });
});
