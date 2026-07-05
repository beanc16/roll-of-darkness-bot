import { DataTransferPipeline } from '../../../../../../services/DataTransfer/DataTransferPipeline.js';
import { DataTransferService } from '../../../../../../services/DataTransfer/DataTransferService.js';
import { PtuFakemonCollection } from '../../../../dal/models/PtuFakemonCollection.js';
import { FakemonCollectionToPtuCollectionTypeShiftAdapter, FakemonCollectionToPtuCollectionTypeShiftAdapterOutput } from '../adapters/FakemonCollectionToPtuCollectionTypeShiftAdapter.js';
import { FakemonToGoogleSheetsAdapter } from '../adapters/FakemonToGoogleSheetsAdapter.js';
import { FakemonToImageStorageAdapter } from '../adapters/FakemonToImageStorageAdapter.js';
import { FakemonGoogleSheetsData } from '../adapters/types.js';
import { FakemonDatabaseTypeShiftDestination } from '../destinations/FakemonDatabaseTypeShiftDestination.js';
import { FakemonGoogleSheetsDestination } from '../destinations/FakemonGoogleSheetsDestination.js';
import { FakemonImageStorageDestination } from '../destinations/FakemonImageStorageDestination.js';

export enum FakemonTypeShiftDataTransferPipelineKey
{
    Database = 'Database',
    GoogleSheets = 'Google Sheets',
    Image = 'Image',
}

export class FakemonTypeShiftDataTransferService extends DataTransferService<PtuFakemonCollection, FakemonCollectionToPtuCollectionTypeShiftAdapterOutput | FakemonGoogleSheetsData | string | undefined>
{
    constructor()
    {
        super([
            new DataTransferPipeline(
                FakemonTypeShiftDataTransferPipelineKey.Database,
                new FakemonCollectionToPtuCollectionTypeShiftAdapter(),
                new FakemonDatabaseTypeShiftDestination(),
            ),
            new DataTransferPipeline(
                FakemonTypeShiftDataTransferPipelineKey.GoogleSheets,
                new FakemonToGoogleSheetsAdapter(),
                new FakemonGoogleSheetsDestination(),
            ),
            new DataTransferPipeline(
                FakemonTypeShiftDataTransferPipelineKey.Image,
                new FakemonToImageStorageAdapter(),
                new FakemonImageStorageDestination(),
            ),
        ]);
    }
}
