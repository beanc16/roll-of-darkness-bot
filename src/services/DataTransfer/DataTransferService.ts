import { DataTransferPipeline } from './DataTransferPipeline.js';

export abstract class DataTransferService<Input, Output>
{
    constructor(private readonly pipelines: DataTransferPipeline<Input, Output>[])
    {}

    public async transfer(input: Input): Promise<void>
    {
        for (let index = 0; index < this.pipelines.length; index += 1)
        {
            // eslint-disable-next-line no-await-in-loop -- We're intentionally awaiting sequentially
            await this.pipelines[index].transfer(input);
        }
    }

    public async transferBulk(input: Input[]): Promise<void>
    {
        for (let index = 0; index < this.pipelines.length; index += 1)
        {
            // eslint-disable-next-line no-await-in-loop -- We're intentionally awaiting sequentially
            await this.pipelines[index].transferBulk(input);
        }
    }
}
