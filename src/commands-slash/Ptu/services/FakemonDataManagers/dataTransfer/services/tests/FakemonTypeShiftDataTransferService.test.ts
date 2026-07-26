/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
// ^ the above are giving a lot of false negatives for some reason, temporarily disabling

import { FakemonCollectionToPtuCollectionTypeShiftAdapter } from '../../adapters/FakemonCollectionToPtuCollectionTypeShiftAdapter.js';
import { FakemonToGoogleSheetsAdapter } from '../../adapters/FakemonToGoogleSheetsAdapter.js';
import { FakemonToImageStorageAdapter } from '../../adapters/FakemonToImageStorageAdapter.js';
import { FakemonDatabaseTypeShiftDestination } from '../../destinations/FakemonDatabaseTypeShiftDestination.js';
import { FakemonGoogleSheetsDestination } from '../../destinations/FakemonGoogleSheetsDestination.js';
import { FakemonImageStorageDestination } from '../../destinations/FakemonImageStorageDestination.js';
import { FakemonTypeShiftDataTransferService } from '../FakemonTypeShiftDataTransferService.js';

describe(`class: ${FakemonTypeShiftDataTransferService.name}`, () =>
{
    describe('constructor', () =>
    {
        let service: FakemonTypeShiftDataTransferService;

        beforeEach(() =>
        {
            service = new FakemonTypeShiftDataTransferService();
        });

        it('should have pipeline with FakemonCollectionToPtuCollectionTypeShiftAdapter & FakemonDatabaseTypeShiftDestination', () =>
        {
            // Arrange
            const hasDatabasePipeline = service['pipelines'].some(pipeline =>
                pipeline['adapter'] instanceof FakemonCollectionToPtuCollectionTypeShiftAdapter
                && pipeline['destination'] instanceof FakemonDatabaseTypeShiftDestination,
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
