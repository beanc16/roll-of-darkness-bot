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
        inputValue?: string[] | string | null | undefined;
        elementValue: string[] | string | null | undefined;
    }): boolean =>
    {
        if (elementValue === undefined || elementValue === null)
        {
            return false;
        }

        const map: Record<BaseGetLookupSearchMatchType, boolean> = {
            [BaseGetLookupSearchMatchType.ExactMatch]: (
                inputValue !== undefined
                && inputValue !== null
                && (
                    (
                        Array.isArray(elementValue)
                        && elementValue.some((element) =>
                            (
                                Array.isArray(inputValue)
                                && inputValue.some((nestedInputValue) =>
                                    element === nestedInputValue,
                                )
                            )
                            || (
                                typeof inputValue === 'string'
                                && element === inputValue
                            ),
                        )
                    )
                    || (
                        typeof elementValue === 'string'
                        && (
                            (
                                typeof inputValue === 'string'
                                && elementValue === inputValue
                            )
                            || (
                                Array.isArray(inputValue)
                                && inputValue.some((nestedInputValue) =>
                                    elementValue === nestedInputValue,
                                )
                            )
                        )
                    )
                )
            ),
            [BaseGetLookupSearchMatchType.SubstringMatch]: (
                inputValue !== undefined
                && inputValue !== null
                && (
                    (
                        Array.isArray(elementValue)
                        && elementValue.some((element) =>
                            (
                                Array.isArray(inputValue)
                                && inputValue.some((nestedInputValue) =>
                                    element.toLowerCase().includes(nestedInputValue.toLowerCase()),
                                )
                            )
                            || (
                                typeof inputValue === 'string'
                                && element.toLowerCase().includes(inputValue.toLowerCase())
                            ),
                        )
                    )
                    || (
                        typeof elementValue === 'string'
                        && (
                            (
                                typeof inputValue === 'string'
                                && elementValue.toLowerCase().includes(inputValue.toLowerCase())
                            )
                            || (
                                Array.isArray(inputValue)
                                && inputValue.some((nestedInputValue) =>
                                    elementValue.toLowerCase().includes(nestedInputValue.toLowerCase()),
                                )
                            )
                        )
                    )
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
