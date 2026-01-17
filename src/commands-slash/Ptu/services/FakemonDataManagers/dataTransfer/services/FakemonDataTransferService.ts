import { DataTransferPipeline } from '../../../../../../services/DataTransfer/DataTransferPipeline.js';
import { DataTransferService } from '../../../../../../services/DataTransfer/DataTransferService.js';
import { PtuFakemonCollection } from '../../../../dal/models/PtuFakemonCollection.js';
import { PtuPokemonCollection } from '../../../../dal/models/PtuPokemonCollection.js';
import { FakemonCollectionToPtuCollectionAdapter } from '../adapters/FakemonCollectionToPtuCollectionAdapter.js';
import { FakemonToGoogleSheetsAdapter } from '../adapters/FakemonToGoogleSheetsAdapter.js';
import { FakemonGoogleSheetsData } from '../adapters/types.js';
import { FakemonDatabaseDestination } from '../destinations/FakemonDatabaseDestination.js';
import { FakemonGoogleSheetsDestination } from '../destinations/FakemonGoogleSheetsDestination.js';

export enum FakemonDataTransferPipelineKey
{
    Database = 'Database',
    GoogleSheets = 'Google Sheets',
    // TODO: Image
}

export class FakemonDataTransferService extends DataTransferService<PtuFakemonCollection, PtuPokemonCollection | FakemonGoogleSheetsData>
{
    constructor()
    {
        // TODO: Add image transfer pipeline too
        super([
            new DataTransferPipeline(
                FakemonDataTransferPipelineKey.Database,
                new FakemonCollectionToPtuCollectionAdapter(),
                new FakemonDatabaseDestination(),
            ),
            new DataTransferPipeline(
                FakemonDataTransferPipelineKey.GoogleSheets,
                new FakemonToGoogleSheetsAdapter(),
                new FakemonGoogleSheetsDestination(),
            ),
        ]);
    }
}
