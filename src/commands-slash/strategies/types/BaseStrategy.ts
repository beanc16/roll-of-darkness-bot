export interface BaseStrategy<Params, Response>
{
    key: string;
    run(parameters: Params): Response;
}

export type BaseStrategyRecord<
    Key extends string,
    Strategy extends BaseStrategy<any, any>,
> = Record<Key, Strategy>;

export type NestedBaseStrategyRecord<
    Key1 extends string,
    StrategyRecord extends BaseStrategyRecord<any, any>,
> = Record<Key1, StrategyRecord>;
