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

    /**
     * Get an array of unique integers between 1 and max (inclusive)
     */
    public static getUniqueRandomIntegers(max: number, count: number): number[]
    {
        if (count > max)
        {
            throw new Error('Count must be less than or equal to max');
        }

        // Generate an array of integers from 1 to max (inclusive)
        const integers = Array.from({ length: max }, (_, index) => index + 1);

        const output: number[] = [];
        for (let loopIndex = 0; loopIndex < count; loopIndex += 1)
        {
            // Get a random index
            const indexToRemove = this.getRandomInteger(max - loopIndex);

            // Remove the random result from the array
            const [result] = integers.splice(indexToRemove - 1, 1);
            output.push(result);
        }

        return output;
    }
}
