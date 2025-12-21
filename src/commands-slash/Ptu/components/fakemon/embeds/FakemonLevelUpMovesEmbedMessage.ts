import { PtuMove } from '../../../models/PtuMove.js';
import { PtuPokemon } from '../../../types/pokemon.js';
import { FakemonMoveEmbedMessage } from './FakemonEmbedMessage.js';

export class FakemonLevelUpMovesEmbedMessage extends FakemonMoveEmbedMessage
{
    constructor(args: Pick<PtuPokemon, 'moveList'>)
    {
        super({
            title: 'Level Up Move List',
            descriptionLines: FakemonLevelUpMovesEmbedMessage.constructDescriptionLines(args),
        });
    }

    public static constructDescriptionLines(
        { moveList }: Pick<PtuPokemon, 'moveList'>,
        moveNameToMovesRecord: Record<string, PtuMove> = {},
    ): string[]
    {
        return moveList.levelUp.map(({
            level,
            move,
            type,
        }) => `${level} ${move} - ${type}${this.getContestStatInfoByMoveName(move, moveNameToMovesRecord)
            ? ` ${this.getContestStatInfoByMoveName(move, moveNameToMovesRecord)}`
            : ''}`,
        );
    }
}
