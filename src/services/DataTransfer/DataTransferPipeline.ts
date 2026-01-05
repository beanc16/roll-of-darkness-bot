import { Adapter } from './Adapter.js';
import { DataTransferDestination } from './DataTransferDestination.js';

export class DataTransferPipeline<Input, Output>
{
    constructor(
        private readonly adapter: Adapter<Input, Output>,
        private readonly destination: DataTransferDestination<Output, Input>,
    )
    {}

    public async transfer(input: Input): Promise<void>
    {
        const data = await this.adapter.transform(input);
        await this.destination.create(data, input);
    }

    public async transferBulk(input: Input[]): Promise<void>
    {
        for (let index = 0; index < input.length; index += 1)
        {
            // eslint-disable-next-line no-await-in-loop -- We're intentionally awaiting sequentially
            await this.transfer(input[index]);
        }
    }
}
