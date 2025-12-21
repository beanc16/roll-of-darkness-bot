/* eslint-disable max-classes-per-file */

import { EmbedBuilder } from 'discord.js';

import { PtuMove } from '../../../models/PtuMove.js';
import { removeExtraCharactersFromMoveName } from '../../../services/pokemonMoveHelpers/pokemonMoveHelpers.js';

/**
 * `EmbedBuilder` with defaults for `color` and `description`
 * for use with the fakemon subcommand group.
 */
export class FakemonEmbedMessage extends EmbedBuilder
{
    constructor(args: ConstructorParameters<typeof EmbedBuilder>[0] & {
        title: string;
        descriptionLines: string[];
    })
    {
        const {
            descriptionLines,
            ...rest
        } = args;

        super({
            ...rest,
            color: 0xCDCDCD,
            description: descriptionLines.join('\n'),
        });
    }
}

/**
 * `FakemonEmbedMessage` with helpers for formatting
 * move-related embed messages.
 */
export class FakemonMoveEmbedMessage extends FakemonEmbedMessage
{
    protected static getContestStatInfoByMoveName(
        moveName: string,
        moveNameToMovesRecord: Record<string, Pick<PtuMove, 'contestStatType' | 'contestStatEffect'>> = {},
    ): string
    {
        const parsedMoveName = removeExtraCharactersFromMoveName(moveName);

        if (!moveNameToMovesRecord[parsedMoveName])
        {
            return '';
        }

        const { contestStatType, contestStatEffect } = moveNameToMovesRecord[parsedMoveName];

        if (!(contestStatType && contestStatEffect))
        {
            return '';
        }

        return `(${[contestStatType, contestStatEffect].join(' - ')})`;
    }

    protected static joinWithContestInfo(
        moveNames: string[],
        moveNameToMovesRecord: Record<string, Pick<PtuMove, 'contestStatType' | 'contestStatEffect'>> = {},
    ): string
    {
        const hasMoveNameToMovesRecord = Object.keys(moveNameToMovesRecord).length > 0
            ? 'true'
            : 'false';

        return moveNames.reduce<string>((acc, cur, index) =>
        {
            const contestInfo = this.getContestStatInfoByMoveName(cur, moveNameToMovesRecord);
            const booleanToSeparator: Record<'true' | 'false', string> = {
                true: '\n',
                false: ', ',
            };

            const separator = (index > 0) ? booleanToSeparator[hasMoveNameToMovesRecord] : '';

            return `${acc}${separator}${cur}${contestInfo ? ` ${contestInfo}` : ''}`;
        }, '');
    }
}
