type DamageType = 'bashing' | 'lethal' | 'agg';

interface HpParameters
{
    maxHp: number;
    bashingDamage: number;
    lethalDamage: number;
    aggravatedDamage: number;
    amount: number;
    damageType: DamageType;
}

interface HpResponse
{
    newBashingDamage: number;
    newLethalDamage: number;
    newAggravatedDamage: number;
}

interface HpSpecificParameters
{
    bashingDamage: number;
    lethalDamage: number;
    aggravatedDamage: number;
    amount: number;
}

interface NWodDamageManagerConstructorParameters
{
    maxHp: number;
    bashingDamage: number;
    lethalDamage: number;
    aggravatedDamage: number;
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

    increment(damageType: DamageType)
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

    decrement(damageType: DamageType)
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

    upgrade(damageType: DamageType)
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

    getTotalDamage = () => {
        return this.#bashingDamage + this.#lethalDamage + this.#aggravatedDamage;
    };

    getValues()
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
    static #healSpecificDamage({
        bashingDamage,
        lethalDamage,
        aggravatedDamage,
        amount,
    }: HpSpecificParameters): HpResponse
    {
        const orderedDamage = [
            aggravatedDamage,
            lethalDamage,
            bashingDamage,
        ];

        // Heal each damage in order
        const {
            damage: [
                newAggravatedDamage,
                newLethalDamage,
                newBashingDamage,
            ],
        } = orderedDamage.reduce((acc, damage) =>
        {
            if (acc.amount <= 0 || damage <= 0)
            {
                acc.damage.push(damage);
                return acc;
            }

            const remainingDamage = damage - acc.amount;
            acc.damage.push(Math.max(remainingDamage, 0));
            acc.amount = (remainingDamage > 0)
                ? 0                     // Has damage of this tier left, so stop healing
                : remainingDamage * -1; // Overflowed healing, so should do damage to lower tiers of damage types

            return acc;
        }, {
            damage: [] as number[],
            amount,
        });

        return {
            newAggravatedDamage,
            newLethalDamage,
            newBashingDamage,
        };
    }

    static heal({
        bashingDamage,
        lethalDamage,
        aggravatedDamage,
        amount,
        damageType,
    }: Omit<HpParameters, 'maxHp'>)
    {
        const input = {
            // Default to not healing all damage types (by setting them to 0)
            bashingDamage: 0,
            lethalDamage: 0,
            aggravatedDamage: 0,
            amount,
        };

        if (damageType === 'agg')
        {
            input.bashingDamage = bashingDamage;
            input.lethalDamage = lethalDamage;
            input.aggravatedDamage = aggravatedDamage;
        }
        else if (damageType === 'lethal')
        {
            input.bashingDamage = bashingDamage;
            input.lethalDamage = lethalDamage;
        }
        else if (damageType === 'bashing')
        {
            input.bashingDamage = bashingDamage;
        }

        const output = this.#healSpecificDamage(input);

        if (damageType === 'lethal')
        {
            output.newAggravatedDamage = aggravatedDamage;
        }
        else if (damageType === 'bashing')
        {
            output.newAggravatedDamage = aggravatedDamage;
            output.newLethalDamage = lethalDamage;
        }

        return output;
    }

    static downgrade({
        bashingDamage,
        lethalDamage,
        aggravatedDamage,
        amount,
        damageType,
    }: Omit<HpParameters, 'maxHp'>)
    {
        const output = this.heal({
            bashingDamage,
            lethalDamage,
            aggravatedDamage,
            amount,
            damageType,
        });
        let newAmount = amount;

        if (damageType === 'agg')
        {
            const remainderToCarryOver = (output.newAggravatedDamage === 0)
                ? aggravatedDamage
                : newAmount;
            
            output.newLethalDamage = lethalDamage + remainderToCarryOver;
            newAmount = Math.max(newAmount - remainderToCarryOver, 0);
        }

        if (damageType === 'lethal' || damageType === 'agg')
        {
            const remainderToCarryOver = (output.newLethalDamage === 0)
                ? lethalDamage
                : newAmount;
            
            output.newBashingDamage = bashingDamage + remainderToCarryOver;

            if (damageType === 'agg')
            {
                output.newLethalDamage = output.newLethalDamage - remainderToCarryOver;
            }
        }

        return output;
    }

    static damage({
        maxHp,
        bashingDamage,
        lethalDamage,
        aggravatedDamage,
        amount,
        damageType,
    }: HpParameters)
    {
        const damageManager = new NWodDamageManager({
            maxHp,
            bashingDamage,
            lethalDamage,
            aggravatedDamage,
        });

        for (let i = 0; i < amount; i += 1)
        {
            if (damageManager.getTotalDamage() < maxHp)
            {
                damageManager.increment(damageType);
            }
            else
            {
                damageManager.upgrade(damageType);
            }
        }

        return damageManager.getValues();
    }
}
