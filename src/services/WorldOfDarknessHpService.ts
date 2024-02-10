interface HpParameters
{
    maxHp: number;
    bashingDamage: number;
    lethalDamage: number;
    aggravatedDamage: number;
    amount: number;
    damageType: 'bashing' | 'lethal' | 'agg';
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

interface UpgradeParameters
{
    maxHp: number;
    bashingDamage: number;
    lethalDamage: number;
    aggravatedDamage: number;
    damageType: 'bashing' | 'lethal' | 'agg';
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
        let newAmount = amount;
        const output = this.heal({
            bashingDamage,
            lethalDamage,
            aggravatedDamage,
            amount,
            damageType,
        });

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

    static #dealSpecificDamage({
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

            const remainingDamage = damage + acc.amount;
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

    static #upgradeDamage({
        maxHp,
        bashingDamage,
        lethalDamage,
        aggravatedDamage,
        damageType,
    }: UpgradeParameters)
    {
        const output = {
            newBashingDamage: bashingDamage,
            newLethalDamage: lethalDamage,
            newAggravatedDamage: aggravatedDamage,
        };
        let damageToUpgrade = bashingDamage + lethalDamage + aggravatedDamage - maxHp;

        if (damageToUpgrade <= -1)
        {
            return output;
        }

        damageToUpgrade += 1;

        console.log('output 1:', output);
        console.log('damageToUpgrade:', damageToUpgrade);

        if (damageType === 'bashing' && bashingDamage > 0)
        {
            output.newBashingDamage = bashingDamage - damageToUpgrade - 1;
            output.newLethalDamage = lethalDamage + damageToUpgrade;
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

        const output = this.#dealSpecificDamage(input);

        if (damageType === 'lethal')
        {
            output.newAggravatedDamage = aggravatedDamage;
        }
        else if (damageType === 'bashing')
        {
            output.newAggravatedDamage = aggravatedDamage;
            output.newLethalDamage = lethalDamage;
        }

        return this.#upgradeDamage({
            maxHp,
            bashingDamage: output.newBashingDamage,
            lethalDamage: output.newLethalDamage,
            aggravatedDamage: output.newAggravatedDamage,
            damageType,
        });
    }
}
