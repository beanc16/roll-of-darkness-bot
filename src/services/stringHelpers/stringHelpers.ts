export enum RegexLookupType
{
    SubstringCaseInsensitive = 'SUBSTRING_CASE_INSENSITIVE',
    ExactMatch = 'EXACT_MATCH',
    ExactMatchCaseInsensitive = 'EXACT_MATCH_CASE_INSENSITIVE',
}

const escapeRegex = (string: string): string => string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');

export function parseRegexByType(input: string, lookupType: RegexLookupType): string | RegExp | undefined;
export function parseRegexByType(input: string[], lookupType: RegexLookupType): RegExp | undefined;
export function parseRegexByType(input: string | string[], lookupType: RegexLookupType): string | RegExp | undefined
{
    const isArray = Array.isArray(input);
    const inputAsArray = isArray ? input : [input];
    const joined = inputAsArray.map(escapeRegex).join('|');
    const pattern = inputAsArray.length > 1 ? `(${joined})` : joined;

    if (lookupType === RegexLookupType.SubstringCaseInsensitive)
    {
        return new RegExp(pattern, 'i');
    }

    if (lookupType === RegexLookupType.ExactMatchCaseInsensitive)
    {
        return new RegExp(`^${pattern}$`, 'i');
    }

    if (lookupType === RegexLookupType.ExactMatch)
    {
        return isArray ? new RegExp(`^${pattern}$`) : input;
    }

    return undefined;
};

export function capitalizeFirstLetter(input: string): string
{
    return input.charAt(0).toUpperCase() + input.slice(1);
}

export function joinWithOxfordComma(input: string[]): string
{
    if (input.length > 2)
    {
        const allButLast = input.slice(0, -1).join(', ');
        const last = input[input.length - 1];
        return `${allButLast}, and ${last}`;
    }

    if (input.length === 2)
    {
        return input.join(' and ');
    }

    return input.join(', ');
}
