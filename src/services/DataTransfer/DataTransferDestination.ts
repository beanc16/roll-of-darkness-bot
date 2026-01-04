export abstract class DataTransferDestination<Input, Source>
{
    /**
     * Creates the initial data at the transfer destination
     */
    abstract create(input: Input, source: Source): void | Promise<void>;

    /**
     * Bulk creates the initial data at the transfer destination
     */
    async createBulk(bulkInput: {
        input: Input;
        source: Source;
    }[]): Promise<void>
    {
        const promises = bulkInput.map(({ input, source }) => this.create(input, source));
        await Promise.all(promises);
    }

    /**
     * Validates that the input is safe to transfer
     */
    protected abstract validateInput(input: Input): asserts input is Input;

    /**
     * @returns True if the data has already been transferred
     * @returns False if the data has not yet been transferred
     */
    abstract wasTransferred(input: Input, source: Source): boolean | Promise<boolean>;
}
