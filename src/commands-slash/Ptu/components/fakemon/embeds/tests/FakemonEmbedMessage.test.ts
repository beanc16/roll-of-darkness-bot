/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
// ^ the above are giving a lot of false negatives for some reason, temporarily disabling

import { EmbedBuilder } from 'discord.js';

import { PtuContestStatEffect, PtuContestStatType } from '../../../../types/pokemon';
import { FakemonEmbedMessage, FakemonMoveEmbedMessage } from '../FakemonEmbedMessage';

jest.mock('discord.js');

describe.each([
    ['FakemonEmbedMessage', FakemonEmbedMessage],
    ['FakemonMoveEmbedMessage', FakemonMoveEmbedMessage],
])('class: %s', (_, Class) =>
{
    const input: ConstructorParameters<typeof Class>[0] = {
        title: 'Title',
        descriptionLines: ['Line 1', 'Line 2'],
    };

    describe('constructor', () =>
    {
        it('should construct', () =>
        {
            const embedMessage = new Class(input);
            expect(embedMessage).toBeDefined();
        });

        it('should call EmbedBuilder constructor with correct parameters', () =>
        {
            // eslint-disable-next-line no-new
            new Class(input);
            expect(EmbedBuilder).toHaveBeenCalledWith({
                title: input.title,
                color: 0xCDCDCD,
                description: input.descriptionLines.join('\n'),
            });
        });
    });
});

describe('class: FakemonMoveEmbedMessage', () =>
{
    describe('method: getContestStatInfoByMoveName', () =>
    {
        const moveName = 'moveName';
        const moveNameToMovesRecord: Parameters<typeof FakemonMoveEmbedMessage['getContestStatInfoByMoveName']>[1] = {
            [moveName]: {
                contestStatType: PtuContestStatType.Beauty,
                contestStatEffect: PtuContestStatEffect.Incentives,
            },
            foo: {
                contestStatType: PtuContestStatType.Cute,
                contestStatEffect: PtuContestStatEffect.AttentionGrabber,
            },
            missingEffect: {
                contestStatType: PtuContestStatType.Beauty,
            },
            missingType: {
                contestStatEffect: PtuContestStatEffect.Incentives,
            },
        };

        it('should return correctly formatted value', () =>
        {
            const result = FakemonMoveEmbedMessage['getContestStatInfoByMoveName'](
                moveName,
                moveNameToMovesRecord,
            );

            expect(result).toBe(`(${PtuContestStatType.Beauty} - ${PtuContestStatEffect.Incentives})`);
        });

        it('should return empty string if move name is not found in moves record', () =>
        {
            const result = FakemonMoveEmbedMessage['getContestStatInfoByMoveName'](
                'fake',
                moveNameToMovesRecord,
            );

            expect(result).toBe('');
        });

        it('should return empty string if contest stat type or effect are missing from moves record', () =>
        {
            const result1 = FakemonMoveEmbedMessage['getContestStatInfoByMoveName'](
                'missingEffect',
                moveNameToMovesRecord,
            );
            const result2 = FakemonMoveEmbedMessage['getContestStatInfoByMoveName'](
                'missingType',
                moveNameToMovesRecord,
            );

            expect(result1).toBe('');
            expect(result2).toBe('');
        });

        it('should return empty string if no moves record is provided', () =>
        {
            const result = FakemonMoveEmbedMessage['getContestStatInfoByMoveName']('foo');

            expect(result).toBe('');
        });
    });

    describe('method: joinWithContestInfo', () =>
    {
        const moveNames = ['moveName1', 'moveName2'];
        const moveNameToMovesRecord: Parameters<typeof FakemonMoveEmbedMessage['joinWithContestInfo']>[1] = {
            [moveNames[0]]: {
                contestStatType: PtuContestStatType.Beauty,
                contestStatEffect: PtuContestStatEffect.Incentives,
            },
            [moveNames[1]]: {
                contestStatType: PtuContestStatType.Cute,
                contestStatEffect: PtuContestStatEffect.AttentionGrabber,
            },
        };

        it(`should return move names separated by commas when there's no move name to moves record`, () =>
        {
            const result = FakemonMoveEmbedMessage['joinWithContestInfo'](moveNames, {});

            expect(result).toBe(moveNames.join(', '));
        });

        it(`should return move names separated by commas when no move name to moves record is provided`, () =>
        {
            const result = FakemonMoveEmbedMessage['joinWithContestInfo'](moveNames);

            expect(result).toBe(moveNames.join(', '));
        });

        it(`should return move names separated by line when there's a move name to moves record`, () =>
        {
            const result = FakemonMoveEmbedMessage['joinWithContestInfo'](moveNames, moveNameToMovesRecord);

            expect(result).toBe([
                `${moveNames[0]} (${PtuContestStatType.Beauty} - ${PtuContestStatEffect.Incentives})`,
                `${moveNames[1]} (${PtuContestStatType.Cute} - ${PtuContestStatEffect.AttentionGrabber})`,
            ].join('\n'));
        });
    });
});
