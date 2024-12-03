import Singleton from './Singleton.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Allow for generic
type ArrayCallback<Element extends any[] = unknown[], Response = boolean> = (
    value: Element[number],
    index: number,
    array: Element[],
) => Response;

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Allow for generic
export class ArraySingleton<Element extends any[] = unknown[]> extends Singleton<Element>
{
    // Getters/Setters
    get length(): number
    {
        return this.value.length;
    }

    // Modifiers
    public push(...items: Element[number][]): void
    {
        this.value.push(items);
    }

    public pop(): Element[number] | undefined
    {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- This is only an issue due to the generic type
        return this.value.pop();
    }

    public unshift(...items: Element[number][]): void
    {
        this.value.unshift(items);
    }

    public shift(): Element[number] | undefined
    {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- This is only an issue due to the generic type
        return this.value.shift();
    }

    // Helpers
    public includes(searchElement: Element[number], fromIndex?: number): boolean
    {
        return this.value.includes(searchElement, fromIndex);
    }

    public find(callback: ArrayCallback<Element>): Element[number] | undefined
    {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- This is only an issue due to the generic type
        return this.value.find(callback);
    }

    public findIndex(predicate: ArrayCallback<Element>): number
    {
        return this.value.findIndex(predicate);
    }

    public findLast(callback: ArrayCallback<Element>): Element[number] | undefined
    {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- This is only an issue due to the generic type
        return this.value.findLast(callback);
    }

    public findLastIndex(predicate: ArrayCallback<Element>): number
    {
        return this.value.findLastIndex(predicate);
    }

    public indexOf(searchElement: Element[number], fromIndex?: number): number
    {
        return this.value.indexOf(searchElement, fromIndex);
    }

    public lastIndexOf(searchElement: Element[number], fromIndex?: number): number
    {
        return this.value.lastIndexOf(searchElement, fromIndex);
    }

    public every(predicate: ArrayCallback<Element>): boolean
    {
        return this.value.every(predicate);
    }

    public some(predicate: ArrayCallback<Element>): boolean
    {
        return this.value.some(predicate);
    }

    // Iterators
    public forEach(callback: ArrayCallback<Element, void>): void
    {
        this.value.forEach(callback);
    }

    public map<U>(callback: ArrayCallback<Element, U>): U[]
    {
        return this.value.map(callback);
    }

    public filter(callback: ArrayCallback<Element>): Element[number][]
    {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- This is only an issue due to the generic type
        return this.value.filter(callback);
    }

    public reduce<U>(
        callback: (
            accumulator: U,
            currentValue: Element[number],
            index: number,
            array: Element[],
        ) => U,
        initialValue: U,
    ): U
    {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- This is only an issue due to the generic type
        return this.value.reduce(callback, initialValue);
    }
}
