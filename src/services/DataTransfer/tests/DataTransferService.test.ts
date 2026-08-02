import { DataTransferService } from '../DataTransferService.js';
import { FakeDataTransferPipeline } from './fakes/FakeDataTransferPipeline.js';
import { FakeDataTransferService } from './fakes/FakeDataTransferService.js';

describe(`class: ${DataTransferService.name}`, () =>
{
    describe(`method: ${FakeDataTransferService.prototype.transfer.name}`, () =>
    {
        it.each([1, 2, 3])('should transfer using %s pipeline(s)', async (numOfPipelines) =>
        {
            // Arrange
            const pipelines = Array.from({ length: numOfPipelines }, () => new FakeDataTransferPipeline());
            const service = new FakeDataTransferService(pipelines);
            const input = 42;
            const transferSpies = pipelines.map((pipeline) => jest.spyOn(pipeline, 'transfer'));

            // Act
            await service.transfer(input);

            // Assert
            transferSpies.forEach((spy) =>
            {
                expect(spy).toHaveBeenCalledTimes(1);
                expect(spy).toHaveBeenCalledWith(42);
            });
        });
    });

    describe(`method: ${FakeDataTransferService.prototype.transferBulk.name}`, () =>
    {
        it.each([1, 2, 3])('should transfer bulk using %s pipeline(s)', async (numOfPipelines) =>
        {
            // Arrange
            const pipelines = Array.from({ length: numOfPipelines }, () => new FakeDataTransferPipeline());
            const service = new FakeDataTransferService(pipelines);
            const inputs = [1, 2, 3];
            const transferBulkSpies = pipelines.map((pipeline) => jest.spyOn(pipeline, 'transferBulk'));

            // Act
            await service.transferBulk(inputs);

            // Assert
            transferBulkSpies.forEach((spy) =>
            {
                expect(spy).toHaveBeenCalledTimes(1);
                expect(spy).toHaveBeenCalledWith([1, 2, 3]);
            });
        });
    });
});
