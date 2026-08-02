import { DataTransferDestination } from '../DataTransferDestination.js';
import { FakeDataTransferDestination } from './fakes/FakeDataTransferDestination.js';

describe(`class: ${DataTransferDestination.name}`, () =>
{
    let destination: FakeDataTransferDestination;

    beforeEach(() =>
    {
        jest.clearAllMocks();
        destination = new FakeDataTransferDestination();
    });

    describe(`method: ${FakeDataTransferDestination.prototype.create.name}`, () =>
    {
        it('should create', () =>
        {
            // Arrange
            const input = 'test';
            const source = 42;

            // Act & Assert
            expect(() => destination.create(input, source)).not.toThrow();
        });
    });

    describe(`method: ${FakeDataTransferDestination.prototype.createBulk.name}`, () =>
    {
        it('should not throw if an empty array is provided', async () =>
        {
            // Arrange
            const bulkInput: { input: string; source: number }[] = [];
            const createSpy = jest.spyOn(destination, 'create');

            // Act & Assert
            await expect(destination.createBulk(bulkInput)).resolves.not.toThrow();
            expect(createSpy).not.toHaveBeenCalled();
        });

        it('should create a single item', async () =>
        {
            // Arrange
            const bulkInput = [{ input: 'test', source: 42 }];
            const createSpy = jest.spyOn(destination, 'create');

            // Act
            await destination.createBulk(bulkInput);

            // Assert
            expect(createSpy).toHaveBeenCalledTimes(1);
            expect(createSpy).toHaveBeenCalledWith('test', 42);
        });

        it('should create multiple items', async () =>
        {
            // Arrange
            const bulkInput = [
                { input: 'first', source: 1 },
                { input: 'second', source: 2 },
                { input: 'third', source: 3 },
            ];
            const createSpy = jest.spyOn(destination, 'create');

            // Act
            await destination.createBulk(bulkInput);

            // Assert
            expect(createSpy).toHaveBeenCalledTimes(3);
            expect(createSpy).toHaveBeenNthCalledWith(1, 'first', 1);
            expect(createSpy).toHaveBeenNthCalledWith(2, 'second', 2);
            expect(createSpy).toHaveBeenNthCalledWith(3, 'third', 3);
        });

        it('should create a large array (100 elements)', async () =>
        {
            // Arrange
            const bulkInput = Array.from({ length: 100 }, (_, index) => ({
                input: `input${index}`,
                source: index,
            }));
            const createSpy = jest.spyOn(destination, 'create');

            // Act
            await destination.createBulk(bulkInput);

            // Assert
            expect(createSpy).toHaveBeenCalledTimes(100);
            bulkInput.forEach(({ input, source }, index) =>
            {
                expect(createSpy).toHaveBeenNthCalledWith(index + 1, input, source);
            });
        });
    });

    describe(`method: ${FakeDataTransferDestination.prototype['validateInput'].name}`, () =>
    {
        it('should not throw for valid input', () =>
        {
            // Arrange
            const input = 'valid input';

            // Act & Assert
            expect(() => destination['validateInput'](input)).not.toThrow();
        });

        it('should throw an error if input is invalid', () =>
        {
            // Arrange
            const input = 123 as unknown as string;

            // Act & Assert
            expect(() => destination['validateInput'](input)).toThrow('Invalid input');
        });
    });

    describe(`method: ${FakeDataTransferDestination.prototype.wasTransferred.name}`, () =>
    {
        it.each([
            [true, 'transferred'],
            [false, 'not transferred'],
        ])('should return %s when %s', (expectedResult, input) =>
        {
            // Arrange
            const source = 42;

            // Act
            const result = destination.wasTransferred(input, source);

            // Assert
            expect(result).toBe(expectedResult);
        });
    });
});
