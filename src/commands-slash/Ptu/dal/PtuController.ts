import { MongoDbController } from 'mongodb-controller';

import { parseRegexByType, RegexLookupType } from '../../../services/stringHelpers/stringHelpers.js';
import { PtuMoveListType } from '../types/pokemon.js';
import { PtuPokemonCollection } from './models/PtuPokemonCollection.js';

type ParseSearchParametersResponse = Record<string, string | RegExp | object | object[] | undefined>;

export class PokemonController extends MongoDbController
{
    public static dbName = 'ptu-microservice';
    public static collectionName = 'pokemon';
    public static Model = PtuPokemonCollection;
    // TODO: Figure out if it's necessary to add this later or not
    // static sortOptions = {
    //     name: 'ascending',
    // };

    public static getMoveListTypeSearchParams(moveNames: string[], moveListType: PtuMoveListType): ParseSearchParametersResponse
    {
        let key: string = `moveList.${moveListType}`;
        let output: ParseSearchParametersResponse = {};

        const getEggTutorZygardeOutput = (): ParseSearchParametersResponse =>
        {
            return {
                [key]: { $in: moveNames },
            };
        };

        const getTmHmOutput = (): ParseSearchParametersResponse =>
        {
            return {
                [key]: parseRegexByType(
                    moveNames,
                    RegexLookupType.SubstringCaseInsensitive,
                ),
            };
        };

        const getLevelUpOutput = (): ParseSearchParametersResponse =>
        {
            return {
                [key]: {
                    $elemMatch: {
                        move: {
                            $in: moveNames,
                        },
                    },
                },
            };
        };

        // eslint-disable-next-line default-case
        switch (moveListType)
        {
            case PtuMoveListType.EggMoves:
            case PtuMoveListType.TutorMoves:
            case PtuMoveListType.ZygardeCubeMoves:
                output = getEggTutorZygardeOutput();
                break;
            case PtuMoveListType.TmHm:
                output = getTmHmOutput();
                break;
            case PtuMoveListType.LevelUp:
                output = getLevelUpOutput();
                break;
            case PtuMoveListType.All:
                // eslint-disable-next-line no-case-declarations
                const searchParams: object[] = [
                    PtuMoveListType.EggMoves,
                    PtuMoveListType.TutorMoves,
                    PtuMoveListType.ZygardeCubeMoves,
                ].map((listType) =>
                {
                    key = `moveList.${listType}`;
                    return getEggTutorZygardeOutput();
                });

                key = `moveList.${PtuMoveListType.TmHm}`;
                searchParams.push(getTmHmOutput());

                key = `moveList.${PtuMoveListType.LevelUp}`;
                searchParams.push(getLevelUpOutput());

                output = {
                    $or: searchParams,
                };
                break;
        }

        return output;
    }
}
