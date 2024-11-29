export interface BaseLookupDataOptions
{
    includeAllIfNoName?: boolean;
}

export type AutcompleteHandlerMap<AutocompleteParameterName extends string> = Record<
    AutocompleteParameterName,
    () => Promise<{ name: string }[] | undefined>
>;
