import { PtuPokemon } from '../../types/pokemon.js';
import { PtuPokemonCollection } from './PtuPokemonCollection.js';

export enum PtuFakemonStatus
{
    DRAFT = 'Draft',
    READY_FOR_REVIEW = 'Ready for Review',
    FAILED_REVIEW = 'Failed Review',
    PASSED_REVIEW = 'Passed Review',
    TRANSFERRED = 'Transferred',
}

interface PtuFakemonFeedback extends Partial<Omit<PtuPokemon, 'name' | 'olderVersions'>>
{
    feedback?: string;
}

type PtuFakemonCollectionConstructorArgs = ConstructorParameters<typeof PtuPokemonCollection>[0] & {
    /** Discord User IDs that always contains at least Bean's User ID */
    editors: string[];
    status: PtuFakemonStatus;
    /** Discord Text Channel ID that the command to create this fakemon was initially executed in */
    creationChannelId: string;
    feedbacks?: PtuFakemonFeedback[];
};

export class PtuFakemonCollection extends PtuPokemonCollection
{
    public editors: string[];
    public status: PtuFakemonStatus;
    public creationChannelId: string;
    public feedbacks?: PtuFakemonFeedback[];

    constructor(args: PtuFakemonCollectionConstructorArgs)
    {
        super(args);

        this.editors = args.editors;
        this.status = args.status;
        this.creationChannelId = args.creationChannelId;
        this.feedbacks = args.feedbacks;
    }
}
