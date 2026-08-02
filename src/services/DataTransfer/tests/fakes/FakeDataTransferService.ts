import { DataTransferService } from '../../DataTransferService.js';
import { FakeDataTransferPipeline } from './FakeDataTransferPipeline.js';

export class FakeDataTransferService extends DataTransferService<number, string>
{
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor -- Allow for type-safe testing purposes
    constructor(pipelines: FakeDataTransferPipeline[])
    {
        super(pipelines);
    }
}
