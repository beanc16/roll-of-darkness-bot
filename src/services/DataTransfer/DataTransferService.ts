import { DataTransferPipeline } from './DataTransferPipeline.js';

export abstract class DataTransferService<Input, Output>
{
    constructor(private readonly pipelines: DataTransferPipeline<Input, Output>[])
    {}

    public async transfer(input: Input): Promise<void>
    {
        for (const pipeline of this.pipelines)
        {
            await pipeline.transfer(input);
        }
    }

    public async transferBulk(input: Input[]): Promise<void>
    {
        for (const pipeline of this.pipelines)
        {
            await pipeline.transferBulk(input);
        }
    }
}
