import { Adapter } from '../Adapter.js';
import { FakeAdapter } from './fakes/FakeAdapter.js';

describe(`class: ${Adapter.name}`, () =>
{
    let adapter: FakeAdapter;

    beforeEach(() =>
    {
        jest.clearAllMocks();
        adapter = new FakeAdapter();
    });

    describe(`method: ${FakeAdapter.prototype.transform.name}`, () =>
    {
        it('should transform', () =>
        {
            // Arrange
            const input = 42;

            // Act
            const result = adapter.transform(input);

            // Assert
            expect(result).toBe('42');
        });

        it('should transform with index provided', () =>
        {
            // Arrange
            const input = 42;
            const index = 5;

            // Act
            const result = adapter.transform(input, index);

            // Assert
            expect(result).toBe('42');
        });
    });

    describe(`method: ${FakeAdapter.prototype.transformBulk.name}`, () =>
    {
        it('should return an empty array if an empty array is provided', async () =>
        {
            // Arrange
            const inputs: number[] = [];

            // Act
            const result = await adapter.transformBulk(inputs);

            // Assert
            expect(result).toEqual([]);
        });

        it('should transform a single item array', async () =>
        {
            // Arrange
            const inputs = [42];

            // Act
            const result = await adapter.transformBulk(inputs);

            // Assert
            expect(result).toEqual(inputs.map(element => `${element}`));
        });

        it('should transform multiple items', async () =>
        {
            // Arrange
            const inputs = [1, 2, 3, 4, 5];

            // Act
            const result = await adapter.transformBulk(inputs);

            // Assert
            expect(result).toEqual(inputs.map(element => `${element}`));
        });

        it('should transform a large array (100 elements)', async () =>
        {
            // Arrange
            const inputs = Array.from({ length: 100 }, (_, index) => index);

            // Act
            const result = await adapter.transformBulk(inputs);

            // Assert
            expect(result).toEqual(inputs.map(element => `${element}`));
        });

        it('should pass the correct index to transform for each item', async () =>
        {
            // Arrange
            const inputs = [10, 20, 30];
            const transformSpy = jest.spyOn(adapter, 'transform');

            // Act
            await adapter.transformBulk(inputs);

            // Assert
            expect(transformSpy).toHaveBeenCalledTimes(3);
            expect(transformSpy).toHaveBeenNthCalledWith(1, 10, 0);
            expect(transformSpy).toHaveBeenNthCalledWith(2, 20, 1);
            expect(transformSpy).toHaveBeenNthCalledWith(3, 30, 2);
        });
    });
});
