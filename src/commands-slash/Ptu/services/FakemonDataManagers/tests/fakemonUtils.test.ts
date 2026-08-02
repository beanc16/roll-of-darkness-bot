import { PtuFakemonDexType } from '../../../dal/models/PtuFakemonCollection.js';
import { dexTypeToPrefix, ptuFakemonDexTypeToRegionSource } from '../fakemonUtils.js';

describe(`function: ${ptuFakemonDexTypeToRegionSource.name}`, () =>
{
    // Keep updated
    const fullMapping: [PtuFakemonDexType, PtuFakemonDexType][] = Object.entries(dexTypeToPrefix)
        .map(([dexType, prefix]) => [dexType as PtuFakemonDexType, prefix]);

    it.each([
        ...fullMapping,
        ...fullMapping.map(([curDexType, result]) => [`${dexTypeToPrefix[curDexType]} Dex`, result]),
        ['Unknown', undefined],
    ])('should take %s and return %s', (dexType, expected) =>
    {
        // Act
        const result = ptuFakemonDexTypeToRegionSource(dexType);

        // Assert
        expect(result).toEqual(expected);
    });
});
