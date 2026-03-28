declare namespace jest
{
    interface Matchers<R>
    {
        toThrowAggregateError(...expectedMessages: string[]): R;
    }
}
