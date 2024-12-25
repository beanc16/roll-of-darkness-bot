import { ChangelingGoblinFruitRarity } from './types.js';

export class ChangelingGoblinFruit
{
    public name: string;
    public rarity: ChangelingGoblinFruitRarity;
    public pageNumber: string;
    public effect: string;

    constructor(input: string[])
    {
        const [
            name,
            rarity,
            pageNumber,
            effect,
        ] = input;

        // Base values
        this.name = name.trim();
        this.rarity = rarity.trim() as ChangelingGoblinFruitRarity;
        this.pageNumber = pageNumber.trim();
        this.effect = effect.trim();
    }
}
