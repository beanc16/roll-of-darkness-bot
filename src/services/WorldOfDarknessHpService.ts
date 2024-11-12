type DamageType = 'bashing' | 'lethal' | 'agg';

interface WorldOfDarknessHpServiceParameters
{
    maxHp: number;
    bashingDamage: number;
    lethalDamage: number;
    aggravatedDamage: number;
    amount: number;
    damageType: DamageType;
}

interface WorldOfDarknessHpServiceResponse
{
    newBashingDamage: number;
    newLethalDamage: number;
    newAggravatedDamage: number;
}

interface NWodDamageManagerConstructorParameters
{
    maxHp: number;
    bashingDamage: number;
    lethalDamage: number;
    aggravatedDamage: number;
}

interface NWodDamageManagerOperationParameters
{
    amount: number;
    damageType: DamageType;
}

class NWodDamageManager
{
    #bashingDamage: number;
    #lethalDamage: number;
    #aggravatedDamage: number;
    #maxHp: number;

    constructor({
        maxHp,
        bashingDamage,
        lethalDamage,
        aggravatedDamage,
    }: NWodDamageManagerConstructorParameters)
    {
        this.#maxHp = maxHp;
        this.#bashingDamage = bashingDamage;
        this.#lethalDamage = lethalDamage;
        this.#aggravatedDamage = aggravatedDamage;
    }

    get maxHp(): number
    {
        return this.#maxHp;
    }

    get bashingDamage(): number
    {
        return this.#bashingDamage;
    }

    get lethalDamage(): number
    {
        return this.#lethalDamage;
    }

    get aggravatedDamage(): number
    {
        return this.#aggravatedDamage;
    }

    public increment(damageType: DamageType): void
    {
        if (damageType === 'bashing')
        {
            this.#bashingDamage += 1;
        }

        else if (damageType === 'lethal')
        {
            this.#lethalDamage += 1;
        }

        else if (damageType === 'agg')
        {
            this.#aggravatedDamage += 1;
        }
    }

    public decrement(damageType: DamageType): void
    {
        if (damageType === 'bashing')
        {
            this.#bashingDamage -= 1;
        }

        else if (damageType === 'lethal')
        {
            this.#lethalDamage -= 1;
        }

        else if (damageType === 'agg')
        {
            this.#aggravatedDamage -= 1;
        }
    }

    public upgrade(damageType: DamageType): void
    {
        // Upgrade to the next damage type
        if (damageType === 'bashing' || damageType === 'lethal')
        {
            if (this.#lethalDamage + this.#aggravatedDamage < this.#maxHp)
            {
                this.increment('lethal');
            }
            else
            {
                this.increment('agg');
            }
        }
        else if (damageType === 'agg')
        {
            this.increment('agg');
        }

        // Remove from the lowest tier damage type
        if (this.#bashingDamage > 0)
        {
            this.decrement('bashing');
        }
        else if (this.#lethalDamage > 0)
        {
            this.decrement('lethal');
        }
    }

    public damage({
        amount,
        damageType,
    }: NWodDamageManagerOperationParameters): void
    {
        for (let i = 0; i < amount; i += 1)
        {
            if (this.getTotalDamage() < this.#maxHp)
            {
                this.increment(damageType);
            }
            else
            {
                this.upgrade(damageType);
            }
        }
    }

    public heal({
        amount,
        damageType,
    }: NWodDamageManagerOperationParameters): void
    {
        for (let i = 0; i < amount; i += 1)
        {
            if (
                this.#aggravatedDamage > 0
                && damageType === 'agg'
            )
            {
                this.decrement('agg');
            }
            else if (
                this.#lethalDamage > 0
                && (damageType === 'agg' || damageType === 'lethal')
            )
            {
                this.decrement('lethal');
            }
            else if (
                this.#bashingDamage > 0
                && (damageType === 'agg' || damageType === 'lethal' || damageType === 'bashing')
            )
            {
                this.decrement('bashing');
            }
        }
    }

    public downgrade({
        amount,
        damageType,
    }: NWodDamageManagerOperationParameters): void
    {
        for (let i = 0; i < amount; i += 1)
        {
            if (
                this.#aggravatedDamage > 0
                && damageType === 'agg'
            )
            {
                this.decrement('agg');
                this.increment('lethal');
            }
            else if (
                this.#lethalDamage > 0
                && (damageType === 'agg' || damageType === 'lethal')
            )
            {
                this.decrement('lethal');
                this.increment('bashing');
            }
            else if (
                this.#bashingDamage > 0
                && (damageType === 'agg' || damageType === 'lethal' || damageType === 'bashing')
            )
            {
                this.decrement('bashing');
            }
        }
    }

    public getTotalDamage(): number
    {
        return this.#bashingDamage + this.#lethalDamage + this.#aggravatedDamage;
    };

    public getValues(): WorldOfDarknessHpServiceResponse
    {
        return {
            newAggravatedDamage: this.#aggravatedDamage,
            newLethalDamage: this.#lethalDamage,
            newBashingDamage: this.#bashingDamage,
        };
    }
}

export class WorldOfDarknessHpService
{
    public static damage({
        maxHp,
        bashingDamage,
        lethalDamage,
        aggravatedDamage,
        amount,
        damageType,
    }: WorldOfDarknessHpServiceParameters): WorldOfDarknessHpServiceResponse
    {
        const damageManager = new NWodDamageManager({
            maxHp,
            bashingDamage,
            lethalDamage,
            aggravatedDamage,
        });

        damageManager.damage({
            amount,
            damageType,
        });

        return damageManager.getValues();
    }

    public static heal({
        maxHp,
        bashingDamage,
        lethalDamage,
        aggravatedDamage,
        amount,
        damageType,
    }: WorldOfDarknessHpServiceParameters): WorldOfDarknessHpServiceResponse
    {
        const damageManager = new NWodDamageManager({
            maxHp,
            bashingDamage,
            lethalDamage,
            aggravatedDamage,
        });

        damageManager.heal({
            amount,
            damageType,
        });

        return damageManager.getValues();
    }

    public static downgrade({
        maxHp,
        bashingDamage,
        lethalDamage,
        aggravatedDamage,
        amount,
        damageType,
    }: WorldOfDarknessHpServiceParameters): WorldOfDarknessHpServiceResponse
    {
        const damageManager = new NWodDamageManager({
            maxHp,
            bashingDamage,
            lethalDamage,
            aggravatedDamage,
        });

        damageManager.downgrade({
            amount,
            damageType,
        });

        return damageManager.getValues();
    }
}
