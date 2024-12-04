import { parseRegexByType, RegexLookupType } from '../../../src/services/stringHelpers.js';

describe('function: parseRegexByType', () =>
{
    describe(`RegexLookupType: ${RegexLookupType.SubstringCaseInsensitive}`, () =>
    {
        it('should return a case-insensitive regex for a substring match', () =>
        {
            const result = parseRegexByType('hello', RegexLookupType.SubstringCaseInsensitive);
            expect(result).toBeInstanceOf(RegExp);
            expect(result?.toString()).toBe('/hello/i');
        });

        it('should escape special characters in the input string', () =>
        {
            const result = parseRegexByType('hello.world', RegexLookupType.SubstringCaseInsensitive);
            expect(result?.toString()).toBe('/hello\\.world/i');
        });
    });

    describe(`RegexLookupType: ${RegexLookupType.ExactMatchCaseInsensitive}`, () =>
    {
        it('should return a case-insensitive regex for an exact match', () =>
        {
            const result = parseRegexByType('hello', RegexLookupType.ExactMatchCaseInsensitive);
            expect(result).toBeInstanceOf(RegExp);
            expect(result?.toString()).toEqual('/^hello$/i');
        });

        it('should escape special characters in the input string', () =>
        {
            const result = parseRegexByType('hello.world', RegexLookupType.ExactMatchCaseInsensitive);
            expect(result?.toString()).toEqual('/^hello\\.world$/i');
        });
    });

    describe(`RegexLookupType: ${RegexLookupType.ExactMatch}`, () =>
    {
        it('should return the exact string as-is', () =>
        {
            const result = parseRegexByType('hello', RegexLookupType.ExactMatch);
            expect(result).toEqual('hello');
        });

        it('should handle strings with special characters without escaping them', () =>
        {
            const result = parseRegexByType('hello.world', RegexLookupType.ExactMatch);
            expect(result).toEqual('hello.world');
        });
    });

    describe('RegexLookupType: invalid or undefined', () =>
    {
        it('should return undefined for an unknown lookupType', () =>
        {
            const result = parseRegexByType('hello', 'UNKNOWN_TYPE' as RegexLookupType);
            expect(result).toBeUndefined();
        });

        it('should return undefined if no lookupType is provided', () =>
        {
            const result = parseRegexByType('hello', undefined as unknown as RegexLookupType);
            expect(result).toBeUndefined();
        });
    });

    describe('Edge Cases', () =>
    {
        it('should handle an empty string input', () =>
        {
            const result = parseRegexByType('', RegexLookupType.SubstringCaseInsensitive);
            expect(result).toBeInstanceOf(RegExp);
            expect(result?.toString()).toEqual('/(?:)/i');
        });

        it('should handle a string with only special characters', () =>
        {
            const result = parseRegexByType('.*+?^${}()|[]\\', RegexLookupType.ExactMatchCaseInsensitive);
            expect(result?.toString()).toEqual('/^\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\$/i');
        });
    });
});
