/**
 * A class decorator that enforces "implements" of the
 * given interface's static methods
 */
export function staticImplements<T>()
{
    return <U extends T>(_constructor: U) =>
    {
        // No runtime logic; just a compile-time check
    };
}
