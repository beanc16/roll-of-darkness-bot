import { PtuFakemonDexType } from '../../../dal/models/PtuFakemonCollection.js';
import {
    dexTypeAndDexNumberToDexEntry,
    dexTypeToPrefix,
    dexTypeToRegion,
    ptuFakemonDexTypeToRegionSource,
} from '../fakemonUtils.js';

describe(`function: ${ptuFakemonDexTypeToRegionSource.name}`, () =>
{
    // Keep updated
    const fullMapping: [PtuFakemonDexType, PtuFakemonDexType][] = Object.entries(dexTypeToRegion)
        .map(([dexType, prefix]) => [dexType as PtuFakemonDexType, prefix]);

    it.each([
        ...fullMapping,
        ...fullMapping.map(([curDexType, result]) => [`${dexTypeToRegion[curDexType]} Dex`, result]),
        ['Unknown', undefined],
    ])('should take %s and return %s', (dexType, expected) =>
    {
        // Act
        const result = ptuFakemonDexTypeToRegionSource(dexType);

        // Assert
        expect(result).toEqual(expected);
    });
});

describe(`function: ${dexTypeAndDexNumberToDexEntry.name}`, () =>
{
    const allDexTypes = Object.values(PtuFakemonDexType);

    describe.each(allDexTypes)('%s', (untypedDexType) =>
    {
        const dexType = untypedDexType as PtuFakemonDexType;

        it('should take a numeric dex number and not contain a separator', () =>
        {
            // Act
            const result = dexTypeAndDexNumberToDexEntry(dexType, 1);

            // Assert
            expect(result).toEqual(`${dexTypeToPrefix[dexType]}1`);
        });

        it('should take a non-numeric dex number and not contain a separator', () =>
        {
            // Arrange
            const dexNumber = 'Descriptor';

            // Act
            const result = dexTypeAndDexNumberToDexEntry(dexType, dexNumber);

            // Assert
            expect(result).toEqual(`${dexTypeToPrefix[dexType]}-${dexNumber}`);
        });
    });
});
