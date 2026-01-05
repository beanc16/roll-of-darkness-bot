import type { ObjectId } from 'mongodb';

import type { PtuPokemon } from '../../types/pokemon.js';
import { PtuPokemonCollection } from './PtuPokemonCollection.js';

export enum PtuFakemonStatus
{
    DRAFT = 'Draft',
    READY_FOR_REVIEW = 'Ready for Review',
    FAILED_REVIEW = 'Failed Review',
    PASSED_REVIEW = 'Passed Review',
    TRANSFERRED = 'Transferred',
}

export enum PtuFakemonDexType
{
    Eden = 'Eden',
    EdenParadox = 'Eden Paradox',
    EdenDrained = 'Eden Drained',
    EdenLegendary = 'Eden Legendary',
}

interface PtuFakemonFeedback extends Partial<Omit<PtuPokemon, 'name' | 'olderVersions'>>
{
    feedback?: string;
}

type PtuFakemonCollectionConstructorArgs = ConstructorParameters<typeof PtuPokemonCollection>[0] & {
    /** Discord User IDs that always contains at least Bean's User ID */
    editors: string[];
    status: PtuFakemonStatus;
    dexType: PtuFakemonDexType;
    /** Discord Text Channel ID that the command to create this fakemon was initially executed in */
    creationChannelId: string;
    feedbacks?: PtuFakemonFeedback[];
    transferredTo?: {
        googleSheets: {
            pokemonData: boolean;
            pokemonSkills: boolean;
        };
        ptuDatabase: boolean;
        imageStorage: boolean;
    };
};

export class PtuFakemonCollection extends PtuPokemonCollection
{
    public editors: string[];
    public status: PtuFakemonStatus;
    public dexType: PtuFakemonDexType;
    public creationChannelId: string;
    public feedbacks?: PtuFakemonFeedback[];
    public isDeleted?: boolean = false;
    public deletedAt?: Date;
    public transferredTo: {
        googleSheets: {
            pokemonData: boolean;
            pokemonSkills: boolean;
        };
        ptuDatabase: boolean;
        imageStorage: boolean;
    };

    constructor(args: PtuFakemonCollectionConstructorArgs)
    {
        super(args);

        this.editors = args.editors;
        this.status = args.status;
        this.dexType = args.dexType || PtuFakemonDexType.Eden;
        this.creationChannelId = args.creationChannelId;
        this.feedbacks = args.feedbacks;
        this.transferredTo = args.transferredTo || {
            googleSheets: {
                pokemonData: false,
                pokemonSkills: false,
            },
            ptuDatabase: false,
            imageStorage: false,
        };
    }

    get id(): ObjectId
    {
        // eslint-disable-next-line no-underscore-dangle -- Use an underscore to properly interface with mongodb's default _id property
        return this._id;
    }
}
