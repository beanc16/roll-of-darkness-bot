import { PtuFakemonDexType } from '../../dal/models/PtuFakemonCollection.js';

// Exported for unit test assistance
export const dexTypeToPrefix: Record<PtuFakemonDexType, PtuFakemonDexType> = {
    // Eden
    [PtuFakemonDexType.Eden]: PtuFakemonDexType.Eden,
    [PtuFakemonDexType.EdenParadox]: PtuFakemonDexType.Eden,
    [PtuFakemonDexType.EdenDrained]: PtuFakemonDexType.Eden,
    [PtuFakemonDexType.EdenLegendary]: PtuFakemonDexType.Eden,

    // Meridia
    [PtuFakemonDexType.Meridia]: PtuFakemonDexType.Meridia,
    [PtuFakemonDexType.MeridiaParadox]: PtuFakemonDexType.Meridia,
    [PtuFakemonDexType.MeridiaLegendary]: PtuFakemonDexType.Meridia,

    // Magalam
    [PtuFakemonDexType.Magalam]: PtuFakemonDexType.Magalam,
    [PtuFakemonDexType.MagalamParadox]: PtuFakemonDexType.Magalam,
    [PtuFakemonDexType.MagalamLegendary]: PtuFakemonDexType.Magalam,

    // Distira
    [PtuFakemonDexType.Distira]: PtuFakemonDexType.Distira,
    [PtuFakemonDexType.DistiraParadox]: PtuFakemonDexType.Distira,
    [PtuFakemonDexType.DistiraLegendary]: PtuFakemonDexType.Distira,
};

export function ptuFakemonDexTypeToRegionSource(dexType: string): PtuFakemonDexType | undefined
{
    // Matches enum verbatim
    if (dexTypeToPrefix[dexType as PtuFakemonDexType])
    {
        return dexTypeToPrefix[dexType as PtuFakemonDexType];
    }

    // Matches enum with ' Dex' appended
    const allDexTypes = Object.values(PtuFakemonDexType);
    for (let index = 0; index < allDexTypes.length; index += 1)
    {
        const curDexType = allDexTypes[index];
        if (`${curDexType} Dex` === dexType)
        {
            return dexTypeToPrefix[curDexType];
        }
    }

    // No matches
    return undefined;
}
