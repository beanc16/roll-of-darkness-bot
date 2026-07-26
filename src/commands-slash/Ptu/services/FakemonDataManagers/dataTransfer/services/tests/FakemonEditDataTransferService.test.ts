/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
// ^ the above are giving a lot of false negatives for some reason, temporarily disabling

import { FakemonCollectionToPtuCollectionEditAdapter } from '../../adapters/FakemonCollectionToPtuCollectionEditAdapter.js';
import { FakemonToGoogleSheetsAdapter } from '../../adapters/FakemonToGoogleSheetsAdapter.js';
import { FakemonToImageStorageAdapter } from '../../adapters/FakemonToImageStorageAdapter.js';
import { FakemonDatabaseEditDestination } from '../../destinations/FakemonDatabaseEditDestination.js';
import { FakemonGoogleSheetsDestination } from '../../destinations/FakemonGoogleSheetsDestination.js';
import { FakemonImageStorageDestination } from '../../destinations/FakemonImageStorageDestination.js';
import { FakemonEditDataTransferService } from '../FakemonEditDataTransferService.js';

describe(`class: ${FakemonEditDataTransferService.name}`, () =>
{
    describe('constructor', () =>
    {
        let service: FakemonEditDataTransferService;

        beforeEach(() =>
        {
            service = new FakemonEditDataTransferService();
        });

        it('should have pipeline with FakemonCollectionToPtuCollectionEditAdapter & FakemonDatabaseEditDestination', () =>
        {
            // Arrange
            const hasDatabasePipeline = service['pipelines'].some(pipeline =>
                pipeline['adapter'] instanceof FakemonCollectionToPtuCollectionEditAdapter
                && pipeline['destination'] instanceof FakemonDatabaseEditDestination,
            );

            // Assert
            expect(hasDatabasePipeline).toBe(true);
        });

        it('should not have pipeline with FakemonToGoogleSheetsAdapter & FakemonGoogleSheetsDestination', () =>
        {
            // Arrange
            const hasGoogleSheetsPipeline = service['pipelines'].some(pipeline =>
                pipeline['adapter'] instanceof FakemonToGoogleSheetsAdapter
                && pipeline['destination'] instanceof FakemonGoogleSheetsDestination,
            );

            // Assert
            expect(hasGoogleSheetsPipeline).toBe(false);
        });

        it('should not have pipeline with FakemonToImageStorageAdapter & FakemonImageStorageDestination', () =>
        {
            // Arrange
            const hasImagePipeline = service['pipelines'].some(pipeline =>
                pipeline['adapter'] instanceof FakemonToImageStorageAdapter
                && pipeline['destination'] instanceof FakemonImageStorageDestination,
            );

            // Assert
            expect(hasImagePipeline).toBe(false);
        });
    });
});
