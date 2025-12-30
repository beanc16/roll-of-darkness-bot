import { PtuFakemonCollection } from '../../dal/models/PtuFakemonCollection.js';
import { PtuFakemonPseudoCache } from '../../dal/PtuFakemonPseudoCache.js';
import { PtuNaturewalk } from '../../types/pokemon.js';

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

        if (this.hasTooManyOtherCapabilities(newOther))
        {
            throw new Error('Cannot have more than 9 other capabilities + naturewalk');
        }

        return await PtuFakemonPseudoCache.update(messageId, { id: fakemon.id }, {
            capabilities: {
                ...fakemon.capabilities,
                other: newOther.sort(),
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
        if (this.hasTooManyOtherCapabilities(other))
        {
            throw new Error('Cannot have more than 9 other capabilities');
        }

        return await PtuFakemonPseudoCache.update(messageId, { id: fakemon.id }, {
            capabilities: {
                ...fakemon.capabilities,
                other: [...other].sort(),
            },
        });
    }

    /**
     * Sets the specified naturewalk values to the fakemon without
     * overwriting the order of existing other capabilities.
     */
    public static async setNaturewalk({
        messageId,
        fakemon,
        naturewalks,
    }: {
        messageId: string;
        fakemon: PtuFakemonCollection;
        naturewalks: PtuNaturewalk[];
    }): Promise<PtuFakemonCollection>
    {
        if (naturewalks.length > 3)
        {
            throw new Error('Cannot have more than 3 naturewalk values');
        }
        else if (naturewalks.length !== new Set(naturewalks).size)
        {
            throw new Error('Cannot have duplicate naturewalk values');
        }

        const naturewalkCapability = this.formatNaturewalkValuesAsCapabilityName(naturewalks);

        // Create a copy of the other capabilities so that splice
        // doesn't mutate the original array
        const other = [...(fakemon.capabilities?.other || [])];

        // If the naturewalk capability already exists, replace it
        // Otherwise, add it to the end of the list
        const naturewalkIndex = other.findIndex(element => element.toLowerCase().includes('naturewalk'));

        // Add the naturewalk capability
        if (naturewalkCapability)
        {
            if (naturewalkIndex === -1)
            {
                other.push(naturewalkCapability);
            }
            else
            {
                other[naturewalkIndex] = naturewalkCapability;
            }
        }
        // Remove the naturewalk capability if it exists and there's not a new one to add/update
        else if (!naturewalkCapability && naturewalkIndex !== -1)
        {
            other.splice(naturewalkIndex, 1);
        }
        // Naturewalk didn't exist before and doesn't exist now, so do nothing
        else if (!naturewalkCapability && naturewalkIndex === -1)
        {
            return fakemon;
        }

        if (this.hasTooManyOtherCapabilities(other))
        {
            throw new Error('Cannot have more than 9 other capabilities in addition to naturewalk');
        }

        return await PtuFakemonPseudoCache.update(messageId, { id: fakemon.id }, {
            capabilities: {
                ...fakemon.capabilities,
                other: other.sort(),
            },
        });
    }

    /**
     * Finds the naturewalk values from the fakemon's capabilities
     */
    public static findNaturewalkValues({ capabilities }: Pick<PtuFakemonCollection, 'capabilities'>): PtuNaturewalk[]
    {
        const { other = [] } = capabilities;

        const naturewalk = other.find(element => element.toLowerCase().includes('naturewalk'));

        if (!naturewalk)
        {
            return [];
        }

        // Naturewalk capabilities are formatted as "Naturewalk (value1, value2, value3)"
        // So, extract the values between the parenthesis
        const [initialMatch = ''] = naturewalk.match(/\(([^)]*)\)/g) || [];

        if (initialMatch.length === 0)
        {
            return [];
        }

        // Remove parenthesis and split the values by comma
        const curNaturewalks = initialMatch.replaceAll(/[()]/g, '')
            .split(',')
            .map(element => element.trim());
        return curNaturewalks as PtuNaturewalk[];
    }

    /**
     * Formats the naturewalk values into a human-readable string
     */
    public static formatNaturewalkValuesAsCapabilityName(naturewalks: PtuNaturewalk[]): string | undefined
    {
        if (naturewalks.length === 0)
        {
            return undefined;
        }

        return `Naturewalk (${naturewalks.join(', ')})`;
    }

    private static hasTooManyOtherCapabilities(other: PtuFakemonCollection['capabilities']['other']): boolean
    {
        if (!other)
        {
            return false;
        }

        const maxNumOfCapabilities = this.hasNaturewalk(other)
            ? 10
            : 9;

        return other.length > maxNumOfCapabilities;
    }

    private static hasNaturewalk(other: PtuFakemonCollection['capabilities']['other']): boolean
    {
        if (!other)
        {
            return false;
        }

        return other.some(element => element.toLowerCase().includes('naturewalk'));
    }
}
