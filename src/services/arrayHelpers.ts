export const generateIntegerArray = (start: number, end: number): number[] =>
{
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
};

export const generateIntegerArrayAsStrings = (start: number, end: number): [string, ...string[]] =>
{
    return generateIntegerArray(start, end).map((num) => num.toString()) as [string, ...string[]];
};
