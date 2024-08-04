import { GetLookupAbilityDataParameters } from '../commands-slash/Ptu';

export class PtuAbility
{
    public name: string;
    public frequency: string;
    public effect: string;
    public trigger?: string;
    public target?: string;
    public keywords?: string;
    public effect2?: string;

    constructor (input: string[])
    {
        const [
            untrimmedName,
            untrimmedFrequency,
            untrimmedEffect,
            untrimmedTrigger,
            untrimmedTarget,
            untrimmedKeywords,
            untrimmedEffect2,
        ] = input;

        // Base values
        this.name = untrimmedName.trim();
        this.frequency = untrimmedFrequency.trim();
        this.effect = untrimmedEffect.trim();
        this.trigger = untrimmedTrigger?.trim();
        this.target = untrimmedTarget?.trim();
        this.keywords = untrimmedKeywords?.trim();
        this.effect2 = untrimmedEffect2?.trim();
    }

    public IsValidBasedOnInput(input: GetLookupAbilityDataParameters): boolean
    {
        // Name
        if (input.name && input.name !== this.name)
        {
            return false;
        }

        // Frequency
        if (input.frequencySearch && this.frequency && !this.frequency.toLowerCase().includes(input.frequencySearch.toLowerCase()))
        {
            return false;
        }

        return true;
    }
}