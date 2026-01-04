import { DataTransferPipeline } from '../../DataTransferPipeline.js';
import { FakeAdapter } from './FakeAdapter.js';
import { FakeDataTransferDestination } from './FakeDataTransferDestination.js';

export class FakeDataTransferPipeline extends DataTransferPipeline<number, string>
{
    constructor()
    {
        super(new FakeAdapter(), new FakeDataTransferDestination());
    }
}
