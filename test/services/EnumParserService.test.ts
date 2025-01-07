import { EnumParserService } from '../../src/services/EnumParserService.js';

enum NumericEnumToSearch
{
    A = 1,
    B = 2,
    C = 3,
}

enum StringEnumToSearch
{
    A = 'One',
    B = 'Two',
    C = 'Three',
}

enum MultiTypeEnumToSearch
{
    A = 'One',
    B = 2,
    C = 'Three',
    D = 4,
}

enum EmptyEnumToSearch
{}

describe('class: EnumParserService', () =>
{
    describe('function: getEnumKeyByEnumValue', () =>
    {
        it('should return undefined if the enum is empty', () =>
        {
            const result = EnumParserService.getEnumKeyByEnumValue(EmptyEnumToSearch, 'value');
            expect(result).toEqual(undefined);
        });

        describe.each([
            ['numeric', NumericEnumToSearch],
            ['string', StringEnumToSearch],
            ['multi-type', MultiTypeEnumToSearch],
        ])('%s enums', (_, curEnum) =>
        {
            it('should return the correct key of the enum value', () =>
            {
                Object.entries(curEnum).forEach(([key, value]) =>
                {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any -- Allow for testing purposes
                    const result = EnumParserService.getEnumKeyByEnumValue(curEnum as any, value);
                    expect(result).toEqual(key);
                });
            });

            it('should return undefined if the value is not in the enum', () =>
            {
                const value = -1;

                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any -- Allow for testing purposes
                const result = EnumParserService.getEnumKeyByEnumValue(curEnum as any, value);
                expect(result).toEqual(undefined);
            });
        });
    });

    describe('function: isInEnum', () =>
    {
        it('should return false if the enum is empty', () =>
        {
            const result = EnumParserService.isInEnum(EmptyEnumToSearch, 'value');
            expect(result).toEqual(false);
        });

        describe.each([
            ['numeric', NumericEnumToSearch],
            ['string', StringEnumToSearch],
            ['multi-type', MultiTypeEnumToSearch],
        ])('%s enums', (_, curEnum) =>
        {
            it('should return true if the value is in the enum', () =>
            {
                Object.values(curEnum).forEach((value) =>
                {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any -- Allow for testing purposes
                    const result = EnumParserService.isInEnum(curEnum as any, value);
                    expect(result).toEqual(true);
                });
            });

            it('should return false if the value is not in the enum', () =>
            {
                const value = -1;

                // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any -- Allow for testing purposes
                const result = EnumParserService.isInEnum(curEnum as any, value as any);
                expect(result).toEqual(false);
            });
        });
    });
});
