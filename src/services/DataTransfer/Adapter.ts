export abstract class Adapter<Input, Output>
{
    public abstract transform(input: Input, index?: number): Output | Promise<Output>;

    public async transformBulk(inputs: Input[]): Promise<Output[]>
    {
        const results: Output[] = [];

        for (let index = 0; index < inputs.length; index += 1)
        {
            // eslint-disable-next-line no-await-in-loop -- We want the indices to truly be sequential
            const result = await this.transform(inputs[index], index);
            results.push(result);
        }

        return results;
    }
}
