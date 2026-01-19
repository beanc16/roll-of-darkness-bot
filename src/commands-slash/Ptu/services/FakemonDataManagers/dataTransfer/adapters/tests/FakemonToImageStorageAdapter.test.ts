/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
// ^ the above are giving a lot of false negatives for some reason, temporarily disabling

import { PtuFakemonDexType } from '../../../../../dal/models/PtuFakemonCollection.js';
import { createPtuFakemonCollectionData } from '../../../../../fakes/PtuFakemonCollection.fakes.js';
import { FakemonDexNumberPrefix, FakemonGeneralInformationManagerService } from '../../../FakemonGeneralInformationManagerService.js';
import { FakemonToImageStorageAdapter } from '../FakemonToImageStorageAdapter.js';


describe(`class: ${FakemonToImageStorageAdapter.name}`, () =>
{
    let adapter: FakemonToImageStorageAdapter;

    beforeEach(() =>
    {
        jest.clearAllMocks();
        adapter = new FakemonToImageStorageAdapter();
    });

    describe(`method: ${FakemonToImageStorageAdapter.prototype.transform.name}`, () =>
    {
        it(`should return the pokemon's image URL`, async () =>
        {
            // Arrange
            const fakemon = createPtuFakemonCollectionData({ dexType: PtuFakemonDexType.Eden });

            // Act
            const result = adapter.transform(fakemon);

            // Assert
            expect(result).toBe(fakemon.metadata.imageUrl);
        });
    });
});
