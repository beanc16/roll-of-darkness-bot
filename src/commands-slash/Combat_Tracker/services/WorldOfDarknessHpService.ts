import { DamageType } from '../types.js';
import { NWodDamageManager } from './NWodDamageManager.js';
import type { WorldOfDarknessHpServiceResponse } from './types.js';

interface WorldOfDarknessHpServiceParameters
{
    maxHp: number;
    bashingDamage: number;
    lethalDamage: number;
    aggravatedDamage: number;
    amount: number;
    damageType: DamageType;
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
