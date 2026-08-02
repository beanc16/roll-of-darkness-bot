export class BaseCurseborneModel
{
    protected static toArray(value: string): string[]
    {
        return value.split(',').map(cur => cur.trim());
    }
}
