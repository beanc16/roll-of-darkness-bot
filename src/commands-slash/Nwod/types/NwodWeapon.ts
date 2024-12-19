import { NwodWeaponType } from './types.js';

export class NwodWeapon
{
    public name: string;
    public weaponType: NwodWeaponType;
    public damage: string;
    public range: string | undefined;
    public capacity: string | undefined;
    public initiativeModifier: string;
    public strengthRequirement: string;
    public size: string;
    public availability: string | undefined;
    public page: string | undefined;
    public hasBonusEffect: boolean;
    public effect: string;

    constructor(input: string[])
    {
        const [
            name,
            weaponType,
            damage,
            range,
            capacity,
            initiativeModifier,
            strengthRequirement,
            size,
            availability,
            page,
            hasBonusEffect,
            effect,
        ] = input;

        // Base values
        this.name = name.trim();
        this.weaponType = weaponType.trim() as NwodWeaponType;
        this.damage = damage.trim();
        this.range = (range.trim() && range.trim() !== '--') ? range.trim() : undefined;
        this.capacity = (capacity.trim() && capacity.trim() !== '--') ? capacity.trim() : undefined;
        this.initiativeModifier = initiativeModifier.trim();
        this.strengthRequirement = strengthRequirement.trim();
        this.size = size.trim();
        this.availability = (availability.trim() && availability.trim() !== '--') ? availability.trim() : undefined;
        this.page = (page.trim() && page.trim() !== '--') ? page.trim() : undefined;
        this.hasBonusEffect = hasBonusEffect.trim().toLowerCase() === 'true';
        this.effect = effect.trim();
    }
}
