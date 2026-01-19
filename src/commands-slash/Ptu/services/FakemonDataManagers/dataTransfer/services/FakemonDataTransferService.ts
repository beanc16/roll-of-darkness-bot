import { DataTransferPipeline } from '../../../../../../services/DataTransfer/DataTransferPipeline.js';
import { DataTransferService } from '../../../../../../services/DataTransfer/DataTransferService.js';
import { PtuFakemonCollection } from '../../../../dal/models/PtuFakemonCollection.js';
import { PtuPokemonCollection } from '../../../../dal/models/PtuPokemonCollection.js';
import { FakemonCollectionToPtuCollectionAdapter } from '../adapters/FakemonCollectionToPtuCollectionAdapter.js';
import { FakemonToGoogleSheetsAdapter } from '../adapters/FakemonToGoogleSheetsAdapter.js';
import { FakemonToImageStorageAdapter } from '../adapters/FakemonToImageStorageAdapter.js';
import { FakemonGoogleSheetsData } from '../adapters/types.js';
import { FakemonDatabaseDestination } from '../destinations/FakemonDatabaseDestination.js';
import { FakemonGoogleSheetsDestination } from '../destinations/FakemonGoogleSheetsDestination.js';
import { FakemonImageStorageDestination } from '../destinations/FakemonImageStorageDestination.js';

export enum FakemonDataTransferPipelineKey
{
    Database = 'Database',
    GoogleSheets = 'Google Sheets',
    Image = 'Image',
}

export class FakemonDataTransferService extends DataTransferService<PtuFakemonCollection, PtuPokemonCollection | FakemonGoogleSheetsData | string | undefined>
{
    constructor()
    {
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
            new DataTransferPipeline(
                FakemonDataTransferPipelineKey.Image,
                new FakemonToImageStorageAdapter(),
                new FakemonImageStorageDestination(),
            ),
        ]);
    }
}
