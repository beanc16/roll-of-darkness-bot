import { PtuFakemonCollection } from '../../dal/models/PtuFakemonCollection.js';
import { PtuFakemonPseudoCache } from '../../dal/PtuFakemonPseudoCache.js';

export class FakemonCapabilityManagerService
{
    /**
     * Updates the specified fakemon's numeric capabilities whilst
     * retaining all other unspecified capabilities' original values.
     */
    public static async updateNumericCapabilities({
        messageId,
        fakemon,
        capabilities,
    }: {
        messageId: string;
        fakemon: PtuFakemonCollection;
        capabilities: Partial<Omit<PtuFakemonCollection['capabilities'], 'other'>>;
    }): Promise<PtuFakemonCollection>
    {
        if (Object.values(capabilities).length === 0)
        {
            return fakemon;
        }

        Object.entries(capabilities).forEach(([key, value]) =>
        {
            if (value < 0)
            {
                throw new Error(`Capability "${key}" cannot be negative`);
            }
        });

        return await PtuFakemonPseudoCache.update(messageId, { id: fakemon.id }, {
            capabilities: {
                ...fakemon.capabilities,
                ...capabilities,
            },
        });
    }

    /**
     * Adds the specified other capabilities to the fakemon
     * without overwriting any existing other capabilities.
     */
    public static async addOtherCapabilities({
        messageId,
        fakemon,
        other,
    }: {
        messageId: string;
        fakemon: PtuFakemonCollection;
        other: NonNullable<PtuFakemonCollection['capabilities']['other']>;
    }): Promise<PtuFakemonCollection>
    {
        if (other.length === 0)
        {
            return fakemon;
        }

        const newOther: NonNullable<PtuFakemonCollection['capabilities']['other']> = [
            ...(fakemon.capabilities.other || []),
            ...other,
        ];

        if (newOther.length > 9)
        {
            throw new Error('Cannot have more than 9 other capabilities');
        }

        return await PtuFakemonPseudoCache.update(messageId, { id: fakemon.id }, {
            capabilities: {
                ...fakemon.capabilities,
                other: newOther,
            },
        });
    }

    /**
     * Sets the specified other capabilities to the fakemon,
     * overwriting any existing other capabilities.
     */
    public static async setOtherCapabilities({
        messageId,
        fakemon,
        other,
    }: {
        messageId: string;
        fakemon: PtuFakemonCollection;
        other: NonNullable<PtuFakemonCollection['capabilities']['other']>;
    }): Promise<PtuFakemonCollection>
    {
        if (other.length === 0)
        {
            return fakemon;
        }

        if (other.length > 9)
        {
            throw new Error('Cannot have more than 9 other capabilities');
        }

        return await PtuFakemonPseudoCache.update(messageId, { id: fakemon.id }, {
            capabilities: {
                ...fakemon.capabilities,
                other,
            },
        });
    }
}
