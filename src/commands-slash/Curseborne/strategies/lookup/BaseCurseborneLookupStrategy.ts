import { BaseGetLookupDataParams, BaseGetLookupSearchMatchType } from '../../../strategies/BaseLookupStrategy.js';

export class BaseCurseborneLookupStrategy
{
    protected static getNumOfDefinedLookupProperties = (lookupParams: BaseGetLookupDataParams): number =>
    {
        const {
            options: _options,
            ...remainingProperties
        } = lookupParams;

        return Object.values(remainingProperties).reduce<number>((acc, cur) =>
        {
            if (cur !== undefined && cur !== null)
            {
                return acc + 1;
            }
            return acc;
        }, 0);
    };

    protected static hasMatch = (lookupParams: BaseGetLookupDataParams, { inputValue, elementValue }: {
        inputValue?: string | null | undefined;
        elementValue: string;
    }): boolean =>
    {
        const map: Record<BaseGetLookupSearchMatchType, boolean> = {
            [BaseGetLookupSearchMatchType.ExactMatch]: (
                inputValue !== undefined
                && inputValue !== null
                && inputValue === elementValue
            ),
            [BaseGetLookupSearchMatchType.SubstringMatch]: (
                inputValue !== undefined
                && inputValue !== null
                && elementValue.toLowerCase().includes(inputValue.toLowerCase())
            ),
        };

        const {
            options: {
                matchType,
            },
        } = lookupParams;

        return map[matchType];
    };

    protected static hasArrayMatch = (lookupParams: BaseGetLookupDataParams, { inputValue, elementValue }: {
        inputValue?: string | null | undefined;
        elementValue: string[];
    }): boolean =>
    {
        const map: Record<BaseGetLookupSearchMatchType, boolean> = {
            [BaseGetLookupSearchMatchType.ExactMatch]: (
                inputValue !== undefined
                && inputValue !== null
                && elementValue.some((element) => element === inputValue)
            ),
            [BaseGetLookupSearchMatchType.SubstringMatch]: (
                inputValue !== undefined
                && inputValue !== null
                && elementValue.some((element) =>
                    element.toLowerCase().includes(inputValue.toLowerCase()),
                )
            ),
        };

        const {
            options: {
                matchType,
            },
        } = lookupParams;

        return map[matchType];
    };
}
