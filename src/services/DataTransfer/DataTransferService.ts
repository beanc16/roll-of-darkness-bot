import { DataTransferPipeline } from './DataTransferPipeline.js';

export abstract class DataTransferService<Input, Output>
{
    constructor(private readonly pipelines: DataTransferPipeline<Input, Output>[])
    {}

    public async transfer(input: Input): Promise<void>
    {
        const promises = this.pipelines.map((pipeline) => pipeline.transfer(input));
        await Promise.all(promises);
    }

    public async transferBulk(input: Input[]): Promise<void>
    {
        const promises = this.pipelines.map((pipeline) => pipeline.transferBulk(input));
        await Promise.all(promises);
    }
}
