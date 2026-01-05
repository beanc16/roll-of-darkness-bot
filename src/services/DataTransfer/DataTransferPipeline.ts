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
        for (const curInput of input)
        {
            await this.transfer(curInput);
        }
    }
}
