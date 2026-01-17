import { DataTransferPipeline } from './DataTransferPipeline.js';

export abstract class DataTransferService<Input, Output>
{
    constructor(private readonly pipelines: DataTransferPipeline<Input, Output>[])
    {}

    public async transfer(input: Input, keys: string[] = []): Promise<void>
    {
        for (let index = 0; index < this.pipelines.length; index += 1)
        {
            // Don't transfer if keys are given and the key doesn't match
            if (keys.length > 0 && !keys.includes(this.pipelines[index].key))
            {
                continue;
            }

            // eslint-disable-next-line no-await-in-loop -- We're intentionally awaiting sequentially
            await this.pipelines[index].transfer(input);
        }
    }

    public async transferBulk(input: Input[], keys: string[] = []): Promise<void>
    {
        for (let index = 0; index < this.pipelines.length; index += 1)
        {
            // Don't transfer if keys are given and the key doesn't match
            if (keys.length > 0 && !keys.includes(this.pipelines[index].key))
            {
                continue;
            }

            // eslint-disable-next-line no-await-in-loop -- We're intentionally awaiting sequentially
            await this.pipelines[index].transferBulk(input);
        }
    }
}
