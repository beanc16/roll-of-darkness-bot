export class RandomService
{
    /**
     * Get a decimal between 0 and max (inclusive)
     */
    private static getRandomDecimal(max: number): number
    {
        return Math.random() * max;
    }

    /**
     * Get an integer between 1 and max (inclusive)
     */
    public static getRandomInteger(max: number): number
    {
        const randomDecimal = this.getRandomDecimal(max);
        return Math.floor(randomDecimal) + 1;
    }
}
