export enum RegexLookupType
{
    SubstringCaseInsensitive = 'SUBSTRING_CASE_INSENSITIVE',
    ExactMatch = 'EXACT_MATCH',
    ExactMatchCaseInsensitive = 'EXACT_MATCH_CASE_INSENSITIVE',
}

const escapeRegex = (string: string): string => string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');

export const parseRegexByType = (string: string, lookupType: RegexLookupType): string | RegExp | undefined =>
{
    const escapedRegex = escapeRegex(string);

    if (lookupType === RegexLookupType.SubstringCaseInsensitive)
    {
        return new RegExp(escapedRegex, 'i');
    }

    if (lookupType === RegexLookupType.ExactMatchCaseInsensitive)
    {
        return new RegExp(`^${escapedRegex}$`, 'i');
    }

    if (lookupType === RegexLookupType.ExactMatch)
    {
        return string;
    }

    return undefined;
};
