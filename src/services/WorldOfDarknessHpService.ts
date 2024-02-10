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

    static #upgrade({
        maxHp,
        bashingDamage,
        lethalDamage,
        aggravatedDamage,
        amount,
        damageType,
    }: HpParameters)
    {
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
        // Case 1: {
        //     maxHp: 10, // 0/10 damage tracks have damage in them
        //     aggravatedDamage: 0,
        //     lethalDamage: 0,
        //     bashingDamage: 0,
        //     amount: 3,
        //     damageType: 'bashing',
        // }
        // Case 2: {
        //     maxHp: 10, // 6/10 damage tracks have damage in them
        //     aggravatedDamage: 1,
        //     lethalDamage: 2,
        //     bashingDamage: 3,
        //     amount: 3,
        //     damageType: 'bashing',
        // }
        // Case 3: {
        //     maxHp: 10, // 9/10 damage tracks have damage in them
        //     aggravatedDamage: 4,
        //     lethalDamage: 3,
        //     bashingDamage: 2,
        //     amount: 3,
        //     damageType: 'bashing',
        // }
        const emptyHealthBoxes = Math.max(maxHp - aggravatedDamage - lethalDamage - bashingDamage, 0);

        const output = {
            newAggravatedDamage: aggravatedDamage,
            newLethalDamage: lethalDamage,
            newBashingDamage: bashingDamage,
        };

        if (damageType === 'bashing')
        {
        }

        return output;
    }
}
