import { Text } from '@beanc16/discordjs-helpers';

import { PtuPokemon } from '../../../types/pokemon.js';
import { FakemonMoveEmbedMessage } from './FakemonEmbedMessage.js';

type TypeToLevelUpMoves = Record<string, {
    level: string | number;
    move: string;
    type: string;
}[]>;

export class FakemonLevelUpMoveProgressionEmbedMessage extends FakemonMoveEmbedMessage
{
    private static readonly MAX_GAP = 15;

    constructor({ name }: Pick<PtuPokemon, 'name'>, typeToLevelUpMoves: TypeToLevelUpMoves = {})
    {
        super({
            title: `${name} - Level Up Move Progression`,
            descriptionLines: FakemonLevelUpMoveProgressionEmbedMessage.constructDescriptionLines(typeToLevelUpMoves),
        });
    }

    public static constructDescriptionLines(typeToLevelUpMoves: TypeToLevelUpMoves = {}): string[]
    {
        return Object.entries(typeToLevelUpMoves).reduce<string[]>((acc, [type, levelUpMoves]) =>
        {
            acc.push(`### ${type}`);

            let previousLevel: string | number | undefined;
            const currentMoveList = levelUpMoves.reduce<string[]>((innerAcc, cur) =>
            {
                const {
                    level,
                    move,
                    type: curType,
                } = cur;

                // Add a warning if a gap is too big
                if (typeof previousLevel === 'number' && typeof level === 'number')
                {
                    const difference = level - previousLevel;

                    if (difference > this.MAX_GAP)
                    {
                        innerAcc.push(Text.underline(`⚠️ ${difference} lvl gap`));
                    }
                }

                // Add current move
                innerAcc.push(`${level} ${move} - ${curType}`);

                previousLevel = level;
                return innerAcc;
            }, []);

            acc.push(...currentMoveList);

            return acc;
        }, []);
    }
}
