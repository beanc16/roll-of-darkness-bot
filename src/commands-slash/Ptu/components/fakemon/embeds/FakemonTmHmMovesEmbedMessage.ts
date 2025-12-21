import { PtuMove } from '../../../models/PtuMove.js';
import { PtuPokemon } from '../../../types/pokemon.js';
import { FakemonMoveEmbedMessage } from './FakemonEmbedMessage.js';

export class FakemonTmHmMovesEmbedMessage extends FakemonMoveEmbedMessage
{
    constructor(args: Pick<PtuPokemon, 'moveList'>)
    {
        super({
            title: 'TM/HM List',
            descriptionLines: FakemonTmHmMovesEmbedMessage.constructDescriptionLines(args),
        });
    }

    public static constructDescriptionLines(
        { moveList }: Pick<PtuPokemon, 'moveList'>,
        moveNameToMovesRecord: Record<string, PtuMove> = {},
    ): string[]
    {
        const output = this.constructDescription({ moveList }, moveNameToMovesRecord);

        return output.includes('\n') ? output.split('\n') : output.split(', ');
    }

    public static constructDescription(
        { moveList }: Pick<PtuPokemon, 'moveList'>,
        moveNameToMovesRecord: Record<string, PtuMove> = {},
    ): string
    {
        return this.joinWithContestInfo(moveList.tmHm, moveNameToMovesRecord);
    }
}
