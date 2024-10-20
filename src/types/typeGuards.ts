/**
 * Tests if value is of type someEnum.
 */
export function isOfEnum<SomeEnum extends { [s: string]: unknown }>(
    someEnum: SomeEnum,
    value: any
): value is SomeEnum[keyof SomeEnum]
{
    return Object.values(someEnum).includes(value);
}
