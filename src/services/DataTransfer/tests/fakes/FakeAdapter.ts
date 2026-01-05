/* eslint-disable class-methods-use-this */

import { Adapter } from '../../Adapter.js';

export class FakeAdapter extends Adapter<number, string>
{
    public transform(input: number, _index?: number): string | Promise<string>
    {
        return `${input}`;
    }
}
