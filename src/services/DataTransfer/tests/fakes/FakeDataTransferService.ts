import { DataTransferService } from '../../DataTransferService.js';
import { FakeDataTransferPipeline } from './FakeDataTransferPipeline.js';

export class FakeDataTransferService extends DataTransferService<number, string>
{
    constructor(pipelines: FakeDataTransferPipeline[])
    {
        super(pipelines);
    }
}
