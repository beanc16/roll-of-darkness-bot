export type GetEnumKeyByEnumValueParameters<
    Key extends string,
    Value extends string | number
> = {
    enumToSearch: {
        [key in Key]: Value
    };
    value: Value;
}

export type EnumValue<Value extends string | number = string> = Value;
type SomeEnum<EnumKey extends string, EnumValue> = {
    [key in EnumKey]: EnumValue
};

export class EnumParserService
{
    public static getEnumKeyByEnumValue = <
        EnumKey extends string,
        EnumValue
    >(enumToSearch: SomeEnum<EnumKey, EnumValue>, value: EnumValue): string =>
    {
        const keys = Object.keys(enumToSearch) as EnumKey[];

        const filteredKeys = keys.filter((key) => enumToSearch[key] === value);

        const [key] = filteredKeys;

        return key || '';
    }

    public static isInEnum = <
        EnumKey extends string,
        EnumValue
    >(enumToSearch: SomeEnum<EnumKey, EnumValue>, value: EnumValue): boolean =>
    {
        const values = Object.values(enumToSearch) as EnumValue[];

        return values.includes(value);
    }
}