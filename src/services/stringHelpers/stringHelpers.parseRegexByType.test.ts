import { parseRegexByType, RegexLookupType } from './stringHelpers.js';

describe('function: parseRegexByType', () =>
{
    describe('String Input', () =>
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

    describe('Array input', () =>
    {
        describe(`RegexLookupType: ${RegexLookupType.SubstringCaseInsensitive}`, () =>
        {
            it('should return a case-insensitive regex matching any of the strings', () =>
            {
                const result = parseRegexByType(['hello', 'world'], RegexLookupType.SubstringCaseInsensitive);
                expect(result).toBeInstanceOf(RegExp);
                expect(result?.toString()).toBe('/(hello|world)/i');
            });

            it('should escape special characters in each entry', () =>
            {
                const result = parseRegexByType(['hello.world', 'foo.bar'], RegexLookupType.SubstringCaseInsensitive);
                expect(result?.toString()).toBe('/(hello\\.world|foo\\.bar)/i');
            });
        });

        describe(`RegexLookupType: ${RegexLookupType.ExactMatchCaseInsensitive}`, () =>
        {
            it('should return a case-insensitive regex for an exact match against any of the strings', () =>
            {
                const result = parseRegexByType(['hello', 'world'], RegexLookupType.ExactMatchCaseInsensitive);
                expect(result).toBeInstanceOf(RegExp);
                expect(result?.toString()).toBe('/^(hello|world)$/i');
            });

            it('should escape special characters in each entry', () =>
            {
                const result = parseRegexByType(['hello.world', 'foo.bar'], RegexLookupType.ExactMatchCaseInsensitive);
                expect(result?.toString()).toBe('/^(hello\\.world|foo\\.bar)$/i');
            });
        });

        describe(`RegexLookupType: ${RegexLookupType.ExactMatch}`, () =>
        {
            it('should return a case-sensitive regex for an exact match against any of the strings', () =>
            {
                const result = parseRegexByType(['hello', 'world'], RegexLookupType.ExactMatch);
                expect(result).toBeInstanceOf(RegExp);
                expect(result?.toString()).toBe('/^(hello|world)$/');
            });

            it('should escape special characters in each entry', () =>
            {
                const result = parseRegexByType(['hello.world', 'foo.bar'], RegexLookupType.ExactMatch);
                expect(result?.toString()).toBe('/^(hello\\.world|foo\\.bar)$/');
            });
        });

        describe('RegexLookupType: invalid or undefined', () =>
        {
            it('should return undefined for an unknown lookupType', () =>
            {
                const result = parseRegexByType(['hello', 'world'], 'UNKNOWN_TYPE' as RegexLookupType);
                expect(result).toBeUndefined();
            });
        });

        describe('Edge Cases', () =>
        {
            it('should handle a single-entry array without a capture group', () =>
            {
                const result = parseRegexByType(['hello'], RegexLookupType.SubstringCaseInsensitive);
                expect(result?.toString()).toBe('/hello/i');
            });

            it('should handle an empty string entry within the array', () =>
            {
                const result = parseRegexByType(['', 'hello'], RegexLookupType.SubstringCaseInsensitive);
                expect(result?.toString()).toBe('/(|hello)/i');
            });

            it('should handle an array with only special character strings', () =>
            {
                const result = parseRegexByType(['.*', '^$'], RegexLookupType.ExactMatchCaseInsensitive);
                expect(result?.toString()).toBe('/^(\\.\\*|\\^\\$)$/i');
            });
        });
    });
});
