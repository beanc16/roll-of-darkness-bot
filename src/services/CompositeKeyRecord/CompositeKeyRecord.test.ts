import { CompositeKey, CompositeKeyRecord } from './CompositeKeyRecord.js';

describe('class: CompositeKeyRecord', () =>
{
    type TestKey = CompositeKey;
    type TestValue = string;

    let record: CompositeKeyRecord<TestKey, TestValue>;
    let validCompositeKey: TestKey;
    let invalidCompositeKey: TestKey;

    beforeEach(() =>
    {
        validCompositeKey = ['key1', 'key2'];
        invalidCompositeKey = ['nonExistent'];

        record = new CompositeKeyRecord<TestKey, TestValue>();
        record['record'] = { // Manually set the internal properties without methods
            'key1,key2': 'value1',
            'key3,key4': 'value2',
        };
    });

    describe('method: GetAll', () =>
    {
        it('should return an empty object when no keys are set', () =>
        {
            const newRecord = new CompositeKeyRecord<TestKey, TestValue>();
            const result = newRecord.GetAll();
            const expectedResult = {};

            expect(result).toEqual(expectedResult);
        });

        it('should return all stored keys and values', () =>
        {
            const result = record.GetAll();
            const expectedResult = {
                'key1,key2': 'value1',
                'key3,key4': 'value2',
            };

            expect(result).toEqual(expectedResult);
        });
    });

    describe('method: Get', () =>
    {
        it('should return the value associated with a composite key', () =>
        {
            const result = record.Get(validCompositeKey);
            const expectedResult = 'value1';

            expect(result).toEqual(expectedResult);
        });

        it('should return undefined for a non-existent key', () =>
        {
            const result = record.Get(invalidCompositeKey);

            expect(result).toBeUndefined();
        });
    });

    describe('method: Has', () =>
    {
        it('should return true for an existing composite key', () =>
        {
            const result = record.Has(validCompositeKey);
            const expectedResult = true;

            expect(result).toEqual(expectedResult);
        });

        it('should return false for a non-existent composite key', () =>
        {
            const result = record.Has(invalidCompositeKey);
            const expectedResult = false;

            expect(result).toEqual(expectedResult);
        });
    });

    describe('method: Upsert', () =>
    {
        let emptyRecord: CompositeKeyRecord<TestKey, TestValue>;

        beforeEach(() =>
        {
            emptyRecord = new CompositeKeyRecord<TestKey, TestValue>();
        });

        it('should add a new key-value pair', () =>
        {
            emptyRecord.Upsert(validCompositeKey, 'value1');
            const expectedResult = {
                'key1,key2': 'value1',
            };

            expect(emptyRecord['record']).toEqual(expectedResult);
        });

        it('should update an existing key-value pair', () =>
        {
            emptyRecord.Upsert(validCompositeKey, 'value1');
            emptyRecord.Upsert(validCompositeKey, 'newValue');
            const expectedResult = {
                'key1,key2': 'newValue',
            };

            expect(emptyRecord['record']).toEqual(expectedResult);
        });
    });

    describe('method: Clear', () =>
    {
        it('should remove a specific key-value pair', () =>
        {
            record.Clear(validCompositeKey);
            const expectedResult = {
                'key3,key4': 'value2',
            };

            expect(record['record']).toEqual(expectedResult);
        });

        it('should clear all keys when no argument is provided', () =>
        {
            record.Clear();
            const expectedResult = {};

            expect(record['record']).toEqual(expectedResult);
        });
    });

    describe('method: ParseKey', () =>
    {
        it('should correctly parse a composite key into a string', () =>
        {
            const input = ['key1', 2, Symbol('sym')];
            const result = CompositeKeyRecord['ParseKey'](input);
            const expectedResult = input.reduce<string>((acc, str, index) =>
            {
                if (index === 0)
                {
                    return str.toString();
                }

                return `${acc},${str.toString()}`;
            }, '');

            expect(result).toEqual(expectedResult);
        });

        it('should handle keys with special characters', () =>
        {
            const input = ['key,with,commas', 42, 'anotherKey'];
            const result = CompositeKeyRecord['ParseKey'](input);
            const expectedResult = input.join(',');

            expect(result).toEqual(expectedResult);
        });
    });
});
