import { Adapter } from '../../Adapter.js';

export class FakeAdapter extends Adapter<number, string>
{
    public transform(input: number, index?: number): string | Promise<string>
    {
        return `${input}`;
    }
}
