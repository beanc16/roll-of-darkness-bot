import { DataTransferPipeline } from '../../../../../../services/DataTransfer/DataTransferPipeline.js';
import { DataTransferService } from '../../../../../../services/DataTransfer/DataTransferService.js';
import { PtuFakemonCollection } from '../../../../dal/models/PtuFakemonCollection.js';
import { FakemonCollectionToPtuCollectionEditAdapter, FakemonCollectionToPtuCollectionEditAdapterOutput } from '../adapters/FakemonCollectionToPtuCollectionEditAdapter.js';
import { FakemonDatabaseEditDestination } from '../destinations/FakemonDatabaseEditDestination.js';

export enum FakemonEditDataTransferPipelineKey
{
    Database = 'Database',
}

export class FakemonEditDataTransferService extends DataTransferService<PtuFakemonCollection, FakemonCollectionToPtuCollectionEditAdapterOutput>
{
    constructor()
    {
        super([
            new DataTransferPipeline(
                FakemonEditDataTransferPipelineKey.Database,
                new FakemonCollectionToPtuCollectionEditAdapter(),
                new FakemonDatabaseEditDestination(),
            ),
        ]);
    }
}
