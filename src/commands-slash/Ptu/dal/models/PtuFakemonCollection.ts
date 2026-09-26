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
    // Eden
    Eden = 'Eden',
    EdenParadox = 'Eden Paradox',
    EdenDrained = 'Eden Drained',
    EdenUltraBeast = 'Eden Ultra Beast',
    EdenLegendary = 'Eden Legendary',

    // Meridia
    Meridia = 'Meridia',
    MeridiaParadox = 'Meridia Paradox',
    MeridiaUltraBeast = 'Meridia Ultra Beast',
    MeridiaLegendary = 'Meridia Legendary',

    // Magalam
    Magalam = 'Magalam',
    MagalamParadox = 'Magalam Paradox',
    MagalamUltraBeast = 'Magalam Ultra Beast',
    MagalamLegendary = 'Magalam Legendary',

    // Distira
    Distira = 'Distira',
    DistiraParadox = 'Distira Paradox',
    DistiraUltraBeast = 'Distira Ultra Beast',
    DistiraLegendary = 'Distira Legendary',
}

export type PtuFakemonRegionType =
    | PtuFakemonDexType.Eden
    | PtuFakemonDexType.Meridia
    | PtuFakemonDexType.Magalam
    | PtuFakemonDexType.Distira;

interface PtuFakemonFeedback extends Partial<Omit<PtuPokemon, 'name' | 'olderVersions'>>
{
    feedback?: string;
}

type PtuFakemonCollectionConstructorArgs = ConstructorParameters<typeof PtuPokemonCollection>[0] & {
    /** Discord User IDs that always contains at least Bean's User ID */
    editors: string[];
    status: PtuFakemonStatus;
    dexType: PtuFakemonRegionType;
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
    typeShiftOfPokemonName?: string;
    editOfPokemonName?: string;
    editName?: string;
};

export class PtuFakemonCollection extends PtuPokemonCollection
{
    public editors: string[];
    public status: PtuFakemonStatus;
    public dexType: PtuFakemonRegionType;
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

    /** `PtuPokemonCollection.name` for the transfer type shift command */
    public typeShiftOfPokemonName?: string;
    /** `PtuPokemonCollection.name` for the transfer edit command */
    public editOfPokemonName?: string;
    /** `PtuPokemonCollection.edits[number].editName` for the transfer edit command */
    public editName?: string;

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
        this.typeShiftOfPokemonName = args.typeShiftOfPokemonName;
        this.editOfPokemonName = args.editOfPokemonName;
        this.editName = args.editName;
    }

    get id(): ObjectId
    {
        // eslint-disable-next-line no-underscore-dangle -- Use an underscore to properly interface with mongodb's default _id property
        return this._id;
    }
}
