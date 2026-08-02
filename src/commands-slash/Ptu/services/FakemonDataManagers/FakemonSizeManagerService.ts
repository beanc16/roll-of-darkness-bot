import { PtuFakemonCollection } from '../../dal/models/PtuFakemonCollection.js';
import { PtuFakemonPseudoCache } from '../../dal/PtuFakemonPseudoCache.js';
import { PtuSizeAdapterService } from '../PtuSizeAdapterService/PtuSizeAdapterService.js';

export class FakemonSizeManagerService
{
    public static async setWeight({
        messageId,
        fakemon,
        lbs,
    }: {
        messageId: string;
        fakemon: PtuFakemonCollection;
        lbs: number;
    }): Promise<PtuFakemonCollection>
    {
        const weight = PtuSizeAdapterService.adaptWeight(lbs, fakemon.abilities);

        return await PtuFakemonPseudoCache.update(messageId, { id: fakemon.id }, {
            sizeInformation: {
                ...fakemon.sizeInformation,
                weight,
            },
        });
    }

    public static async setHeight({
        messageId,
        fakemon,
        ft,
        inches,
    }: {
        messageId: string;
        fakemon: PtuFakemonCollection;
        ft: number;
        inches: number;
    }): Promise<PtuFakemonCollection>
    {
        const height = PtuSizeAdapterService.adaptHeight(ft, inches);

        return await PtuFakemonPseudoCache.update(messageId, { id: fakemon.id }, {
            sizeInformation: {
                ...fakemon.sizeInformation,
                height,
            },
        });
    }

    public static getHeightFromString(height: string): { feet?: number; inches?: number }
    {
        const match = height.trim().match(/^(\d+)['’‘`´](\d+)["“”]$/);

        if (!match)
        {
            throw new Error(`Invalid feet/inches format: "${height}"`);
        }

        const [, ft, inches] = match;

        return {
            feet: parseInt(ft, 10),
            inches: parseInt(inches, 10),
        };
    }
}
