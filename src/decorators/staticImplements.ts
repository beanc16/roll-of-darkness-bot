/**
 * A class decorator that enforces "implements" of the
 * given interface's static methods
 */
export function staticImplements<T>()
{
    return <U extends T>(constructor: U) => {constructor};
}
