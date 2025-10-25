import type { Roll } from '../../types.js';

export function getFakeRoll(number: number, isRote?: boolean): Roll;
export function getFakeRoll(params: Roll): Roll;
export function getFakeRoll(
    arg1: number | Roll,
    arg2?: boolean,
): Roll
{
    if (typeof arg1 === 'number')
    {
        return {
            number: arg1,
            isRote: arg2 ?? false,
        };
    }

    return {
        number: arg1.number,
        isRote: arg1.isRote,
    };
}
