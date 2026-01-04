export abstract class Adapter<Input, Output>
{
    public abstract transform(input: Input, index?: number): Output | Promise<Output>;

    public async transformBulk(inputs: Input[]): Promise<Output[]>
    {
        return await Promise.all(
            inputs.map((input, index) => this.transform(input, index)),
        );
    }
}
