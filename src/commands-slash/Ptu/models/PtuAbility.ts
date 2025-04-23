import { GetLookupAbilityDataParameters } from '../types/modelParameters.js';

export class PtuAbility
{
    public name: string;
    public frequency: string;
    public effect: string;
    public trigger?: string;
    public target?: string;
    public keywords?: string;
    public effect2?: string;
    public basedOn?: string;

    constructor(input: string[])
    {
        const [
            untrimmedName,
            untrimmedFrequency,
            untrimmedEffect,
            untrimmedTrigger,
            untrimmedTarget,
            untrimmedKeywords,
            untrimmedEffect2,
            basedOn,
        ] = input;

        // Base values
        this.name = untrimmedName.trim();
        this.frequency = untrimmedFrequency.trim();
        this.effect = untrimmedEffect.trim();
        this.trigger = untrimmedTrigger?.trim();
        this.target = untrimmedTarget?.trim();
        this.keywords = untrimmedKeywords?.trim();
        this.effect2 = untrimmedEffect2?.trim();
        this.basedOn = basedOn?.trim();
    }

    public IsValidBasedOnInput(input: GetLookupAbilityDataParameters): boolean
    {
        // Name
        if (input.name && input.name.toLowerCase() !== this.name.toLowerCase())
        {
            return false;
        }

        // Frequency
        if (input.frequencySearch && this.frequency && !this.frequency.toLowerCase().includes(input.frequencySearch.toLowerCase()))
        {
            return false;
        }

        // Based On
        if (input.basedOn && input.basedOn !== this.basedOn)
        {
            return false;
        }

        return true;
    }
}
