import { DataTransferPipeline } from '../DataTransferPipeline.js';
import { FakeAdapter } from './fakes/FakeAdapter.js';
import { FakeDataTransferDestination } from './fakes/FakeDataTransferDestination.js';
import { FakeDataTransferPipeline } from './fakes/FakeDataTransferPipeline.js';

describe(`class: ${DataTransferPipeline.name}`, () =>
{
    let pipeline: FakeDataTransferPipeline;
    let adapter: FakeAdapter;
    let destination: FakeDataTransferDestination;

    beforeEach(() =>
    {
        jest.clearAllMocks();
        pipeline = new FakeDataTransferPipeline();
        adapter = pipeline['adapter'];
        destination = pipeline['destination'] as FakeDataTransferDestination;
    });

    describe(`method: ${FakeDataTransferPipeline.prototype.transfer.name}`, () =>
    {
        it('should transform input and create at destination', async () =>
        {
            // Arrange
            const input = 42;
            const transformSpy = jest.spyOn(adapter, 'transform');
            const createSpy = jest.spyOn(destination, 'create');

            // Act
            await pipeline.transfer(input);

            // Assert
            expect(transformSpy).toHaveBeenCalledTimes(1);
            expect(transformSpy).toHaveBeenCalledWith(42);
            expect(createSpy).toHaveBeenCalledTimes(1);
            expect(createSpy).toHaveBeenCalledWith('42', 42);
        });
    });

    describe(`method: ${FakeDataTransferPipeline.prototype.transferBulk.name}`, () =>
    {
        it('should not throw if an empty array is provided', async () =>
        {
            // Arrange
            const inputs: number[] = [];
            const transferSpy = jest.spyOn(pipeline, 'transfer');

            // Act & Assert
            await expect(pipeline.transferBulk(inputs)).resolves.not.toThrow();
            expect(transferSpy).not.toHaveBeenCalled();
        });

        it('should transfer a single item', async () =>
        {
            // Arrange
            const inputs = [42];
            const transferSpy = jest.spyOn(pipeline, 'transfer');

            // Act
            await pipeline.transferBulk(inputs);

            // Assert
            expect(transferSpy).toHaveBeenCalledTimes(1);
            expect(transferSpy).toHaveBeenCalledWith(42);
        });

        it('should transfer multiple items', async () =>
        {
            // Arrange
            const inputs = [1, 2, 3];
            const transferSpy = jest.spyOn(pipeline, 'transfer');

            // Act
            await pipeline.transferBulk(inputs);

            // Assert
            expect(transferSpy).toHaveBeenCalledTimes(3);
            expect(transferSpy).toHaveBeenNthCalledWith(1, 1);
            expect(transferSpy).toHaveBeenNthCalledWith(2, 2);
            expect(transferSpy).toHaveBeenNthCalledWith(3, 3);
        });

        it('should transfer a large array (100 elements)', async () =>
        {
            // Arrange
            const inputs = Array.from({ length: 100 }, (_, index) => index);
            const transferSpy = jest.spyOn(pipeline, 'transfer');

            // Act
            await pipeline.transferBulk(inputs);

            // Assert
            expect(transferSpy).toHaveBeenCalledTimes(100);
            inputs.forEach((input, index) =>
            {
                expect(transferSpy).toHaveBeenNthCalledWith(index + 1, input);
            });
        });
    });
});
