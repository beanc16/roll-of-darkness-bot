/* eslint-disable class-methods-use-this */

import { DataTransferDestination } from '../../DataTransferDestination.js';

export class FakeDataTransferDestination extends DataTransferDestination<string, number>
{
    public create(_input: string, _source: number): void
    {
    }

    protected validateInput(input: string): asserts input is string
    {
        if (typeof input !== 'string')
        {
            throw new Error('Invalid input');
        }
    }

    public wasTransferred(input: string, _source: number): boolean
    {
        return input === 'transferred';
    }
}
