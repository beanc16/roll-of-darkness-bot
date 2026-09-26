import { PtuFakemonDexType, PtuFakemonRegionType } from '../../dal/models/PtuFakemonCollection.js';
import { FakemonDexNumberPrefix } from './FakemonGeneralInformationManagerService.js';

// Exported for unit test assistance
export const dexTypeToRegion: Record<PtuFakemonDexType, PtuFakemonDexType> = {
    // Eden
    [PtuFakemonDexType.Eden]: PtuFakemonDexType.Eden,
    [PtuFakemonDexType.EdenParadox]: PtuFakemonDexType.Eden,
    [PtuFakemonDexType.EdenDrained]: PtuFakemonDexType.Eden,
    [PtuFakemonDexType.EdenUltraBeast]: PtuFakemonDexType.Eden,
    [PtuFakemonDexType.EdenLegendary]: PtuFakemonDexType.Eden,

    // Meridia
    [PtuFakemonDexType.Meridia]: PtuFakemonDexType.Meridia,
    [PtuFakemonDexType.MeridiaParadox]: PtuFakemonDexType.Meridia,
    [PtuFakemonDexType.MeridiaUltraBeast]: PtuFakemonDexType.Meridia,
    [PtuFakemonDexType.MeridiaLegendary]: PtuFakemonDexType.Meridia,

    // Magalam
    [PtuFakemonDexType.Magalam]: PtuFakemonDexType.Magalam,
    [PtuFakemonDexType.MagalamParadox]: PtuFakemonDexType.Magalam,
    [PtuFakemonDexType.MagalamUltraBeast]: PtuFakemonDexType.Magalam,
    [PtuFakemonDexType.MagalamLegendary]: PtuFakemonDexType.Magalam,

    // Distira
    [PtuFakemonDexType.Distira]: PtuFakemonDexType.Distira,
    [PtuFakemonDexType.DistiraParadox]: PtuFakemonDexType.Distira,
    [PtuFakemonDexType.DistiraUltraBeast]: PtuFakemonDexType.Distira,
    [PtuFakemonDexType.DistiraLegendary]: PtuFakemonDexType.Distira,
};

export const regionToDexType: Record<PtuFakemonRegionType, PtuFakemonDexType[]> = Object.entries(dexTypeToRegion)
    .reduce<Record<PtuFakemonRegionType, PtuFakemonDexType[]>>((acc, [dexType, region]) => ({
        ...acc,
        [region]: acc[region as PtuFakemonRegionType].concat(dexType as PtuFakemonDexType),
    }), {
        [PtuFakemonDexType.Eden]: [],
        [PtuFakemonDexType.Meridia]: [],
        [PtuFakemonDexType.Magalam]: [],
        [PtuFakemonDexType.Distira]: [],
    });

export const dexTypeToPrefix: Record<PtuFakemonDexType, FakemonDexNumberPrefix> = {
    // Eden
    [PtuFakemonDexType.Eden]: FakemonDexNumberPrefix.Eden,
    [PtuFakemonDexType.EdenParadox]: FakemonDexNumberPrefix.EdenParadox,
    [PtuFakemonDexType.EdenDrained]: FakemonDexNumberPrefix.EdenDrained,
    [PtuFakemonDexType.EdenUltraBeast]: FakemonDexNumberPrefix.EdenUltraBeast,
    [PtuFakemonDexType.EdenLegendary]: FakemonDexNumberPrefix.EdenLegendary,

    // Meridia
    [PtuFakemonDexType.Meridia]: FakemonDexNumberPrefix.Meridia,
    [PtuFakemonDexType.MeridiaParadox]: FakemonDexNumberPrefix.MeridiaParadox,
    [PtuFakemonDexType.MeridiaUltraBeast]: FakemonDexNumberPrefix.MeridiaUltraBeast,
    [PtuFakemonDexType.MeridiaLegendary]: FakemonDexNumberPrefix.MeridiaLegendary,

    // Magalam
    [PtuFakemonDexType.Magalam]: FakemonDexNumberPrefix.Magalam,
    [PtuFakemonDexType.MagalamParadox]: FakemonDexNumberPrefix.MagalamParadox,
    [PtuFakemonDexType.MagalamUltraBeast]: FakemonDexNumberPrefix.MagalamUltraBeast,
    [PtuFakemonDexType.MagalamLegendary]: FakemonDexNumberPrefix.MagalamLegendary,

    // Distira
    [PtuFakemonDexType.Distira]: FakemonDexNumberPrefix.Distira,
    [PtuFakemonDexType.DistiraParadox]: FakemonDexNumberPrefix.DistiraParadox,
    [PtuFakemonDexType.DistiraUltraBeast]: FakemonDexNumberPrefix.DistiraUltraBeast,
    [PtuFakemonDexType.DistiraLegendary]: FakemonDexNumberPrefix.DistiraLegendary,
};

export function ptuFakemonDexTypeToRegionSource(dexType: string): PtuFakemonDexType | undefined
{
    // Matches enum verbatim
    if (dexTypeToRegion[dexType as PtuFakemonDexType])
    {
        return dexTypeToRegion[dexType as PtuFakemonDexType];
    }

    // Matches enum with ' Dex' appended
    const allDexTypes = Object.values(PtuFakemonDexType);
    for (let index = 0; index < allDexTypes.length; index += 1)
    {
        const curDexType = allDexTypes[index];
        if (`${curDexType} Dex` === dexType)
        {
            return dexTypeToRegion[curDexType];
        }
    }

    // No matches
    return undefined;
}

export const dexTypeAndDexNumberToDexEntry = (dexType: PtuFakemonDexType, dexNumber: string | number): string =>
{
    const dexPrefix = dexTypeToPrefix[dexType];

    // Non-Numeric dex numbers have a hyphen between them
    const num = parseFloat(dexNumber.toString());
    const separator = Number.isNaN(num) ? '-' : '';

    return `${dexPrefix}${separator}${dexNumber.toString()}`;
};
