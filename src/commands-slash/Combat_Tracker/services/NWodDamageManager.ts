import { DamageType } from '../types.js';
import { WorldOfDarknessHpServiceResponse } from './types.js';

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

export class NWodDamageManager
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
        if (damageType === DamageType.Bashing || damageType === DamageType.Lethal)
        {
            if (this.#lethalDamage + this.#aggravatedDamage < this.#maxHp)
            {
                this.increment(DamageType.Lethal);
            }
            else
            {
                this.increment(DamageType.Aggravated);
            }
        }
        else if (damageType === DamageType.Aggravated)
        {
            this.increment(DamageType.Aggravated);
        }

        // Remove from the lowest tier damage type
        if (this.#bashingDamage > 0)
        {
            this.decrement(DamageType.Bashing);
        }
        else if (this.#lethalDamage > 0)
        {
            this.decrement(DamageType.Lethal);
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
                && damageType === DamageType.Aggravated
            )
            {
                this.decrement(DamageType.Aggravated);
            }
            else if (
                this.#lethalDamage > 0
                && (damageType === DamageType.Aggravated || damageType === DamageType.Lethal)
            )
            {
                this.decrement(DamageType.Lethal);
            }
            else if (
                this.#bashingDamage > 0
                && (damageType === DamageType.Aggravated || damageType === DamageType.Lethal || damageType === DamageType.Bashing)
            )
            {
                this.decrement(DamageType.Bashing);
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
                && damageType === DamageType.Aggravated
            )
            {
                this.decrement(DamageType.Aggravated);
                this.increment(DamageType.Lethal);
            }
            else if (
                this.#lethalDamage > 0
                && (damageType === DamageType.Aggravated || damageType === DamageType.Lethal)
            )
            {
                this.decrement(DamageType.Lethal);
                this.increment(DamageType.Bashing);
            }
            else if (
                this.#bashingDamage > 0
                && (damageType === DamageType.Aggravated || damageType === DamageType.Lethal || damageType === DamageType.Bashing)
            )
            {
                this.decrement(DamageType.Bashing);
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
