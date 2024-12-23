export enum NwodAutocompleteParameterName
{
    ConditionName = 'condition_name',
    ContractName = 'contract_name',
    TiltName = 'tilt_name',
    MeritName = 'merit_name',
    NeedleName = 'needle_name',
    ThreadName = 'thread_name',
    TokenName = 'token_name',
    WeaponName = 'weapon_name',
}

export enum NwodLookupRange
{
    Condition = `'Conditions Index'!A2:Z`,
    Contract = `'Changeling Contracts'!A2:Z`,
    Merit = `'Merits'!A2:Z`,
    Needle = `'Needle Archetype Reference'!A3:Z`,
    Thread = `'Thread Archetype Reference'!A3:Z`,
    Tilt = `'Tilts Index'!A3:Z`,
    Token = `'Tokens Index'!A3:Z`,
    Weapon = `'Weapons Index'!A3:Z`,
}
