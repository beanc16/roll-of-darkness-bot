export enum NwodAutocompleteParameterName
{
    ConditionName = 'condition_name',
    ContractName = 'contract_name',
    MeritName = 'merit_name',
    NeedleName = 'needle_name',
}

export enum NwodLookupRange
{
    Condition = `'Conditions Index'!A2:Z`,
    Contract = `'Changeling Contracts'!A2:Z`,
    Merit = `'Merits'!A2:Z`,
    Needle = `'Needle Archetype Reference'!A3:Z`,
}
