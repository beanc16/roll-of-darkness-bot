export interface BaseLookupDataOptions
{
    includeAllIfNoName?: boolean;
}

export type AutocompleteHandlerMap<AutocompleteParameterName extends string> = Record<
    AutocompleteParameterName,
    () => Promise<{ name: string; patron?: string }[] | undefined>
>;
