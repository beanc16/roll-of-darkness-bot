export type GetEnumKeyByEnumValueParameters<
    Key extends string,
    Value extends string | number,
> = {
    enumToSearch: {
        [key in Key]: Value
    };
    value: Value;
};

export type EnumValue<Value extends string | number = string> = Value;
type SomeEnum<EnumKey extends string, EnumVal> = {
    [key in EnumKey]: EnumVal
};

export class EnumParserService
{
    public static getEnumKeyByEnumValue<
        EnumKey extends string,
        EnumVal,
    >(enumToSearch: SomeEnum<EnumKey, EnumVal>, value: EnumVal): EnumKey | undefined
    {
        const keys = Object.keys(enumToSearch) as EnumKey[];

        const filteredKeys = keys.filter(key => enumToSearch[key] === value);

        const [key] = filteredKeys;

        return key;
    }

    public static isInEnum<
        EnumKey extends string,
        EnumVal,
    >(enumToSearch: SomeEnum<EnumKey, EnumVal>, value: EnumVal): boolean
    {
        const values = Object.values(enumToSearch);

        return values.includes(value);
    }
}
