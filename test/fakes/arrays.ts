export function getFakeArray<Element>(value: Element, length: number): Element[]
{
    return Array.from({ length }, (_, _index) => value);
}
