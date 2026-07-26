/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
// ^ the above are giving a lot of false negatives for some reason, temporarily disabling

import { FakemonCollectionToPtuCollectionAdapter } from '../../adapters/FakemonCollectionToPtuCollectionAdapter.js';
import { FakemonToGoogleSheetsAdapter } from '../../adapters/FakemonToGoogleSheetsAdapter.js';
import { FakemonToImageStorageAdapter } from '../../adapters/FakemonToImageStorageAdapter.js';
import { FakemonDatabaseDestination } from '../../destinations/FakemonDatabaseDestination';
import { FakemonGoogleSheetsDestination } from '../../destinations/FakemonGoogleSheetsDestination.js';
import { FakemonImageStorageDestination } from '../../destinations/FakemonImageStorageDestination.js';
import { FakemonDataTransferService } from '../FakemonDataTransferService.js';

describe(`class: ${FakemonDataTransferService.name}`, () =>
{
    describe('constructor', () =>
    {
        let service: FakemonDataTransferService;

        beforeEach(() =>
        {
            service = new FakemonDataTransferService();
        });

        it('should have pipeline with FakemonCollectionToPtuCollectionAdapter & FakemonDatabaseDestination', () =>
        {
            // Arrange
            const hasDatabasePipeline = service['pipelines'].some(pipeline =>
                pipeline['adapter'] instanceof FakemonCollectionToPtuCollectionAdapter
                && pipeline['destination'] instanceof FakemonDatabaseDestination,
            );

            // Assert
            expect(hasDatabasePipeline).toBe(true);
        });

        it('should have pipeline with FakemonToGoogleSheetsAdapter & FakemonGoogleSheetsDestination', () =>
        {
            // Arrange
            const hasGoogleSheetsPipeline = service['pipelines'].some(pipeline =>
                pipeline['adapter'] instanceof FakemonToGoogleSheetsAdapter
                && pipeline['destination'] instanceof FakemonGoogleSheetsDestination,
            );

            // Assert
            expect(hasGoogleSheetsPipeline).toBe(true);
        });

        it('should have pipeline with FakemonToImageStorageAdapter & FakemonImageStorageDestination', () =>
        {
            // Arrange
            const hasImagePipeline = service['pipelines'].some(pipeline =>
                pipeline['adapter'] instanceof FakemonToImageStorageAdapter
                && pipeline['destination'] instanceof FakemonImageStorageDestination,
            );

            // Assert
            expect(hasImagePipeline).toBe(true);
        });
    });
});
