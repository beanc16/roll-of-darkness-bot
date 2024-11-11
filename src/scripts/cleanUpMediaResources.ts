import { discordLogger, logger } from '@beanc16/logger';
import { FileStorageMicroservice } from '@beanc16/microservices-abstraction';
import { Timer } from '../services/Timer.js';
import { Text } from '@beanc16/discordjs-helpers';

let exitCode = 0;

try
{
    logger.debug('Starting to bulk delete images for /media image...');

    // Retry variables
    const maxNumberOfRetries = 10;
    const secondsBetweenRetries = 10;
    const olderThanInDays = 7;

    // Post-rety variables
    let numOfFilesDeleted = 0;
    let wasSuccessful = false;

    // Retry bulk delete with a delay until it works or the max number of retries is reached
    for (let index = 0; index < maxNumberOfRetries; index++)
    {
        // Delete all images used by /media image that are older than the specified time
        const {
            statusCode = 200,
            data,
            error,
        } = await FileStorageMicroservice.v1.deleteBulk({
            app: {
                id: process.env.APP_ID as string,
            },
            nestedFolders: 'image-commands',
            olderThanInDays,
        });

        if (statusCode === 200)
        {
            numOfFilesDeleted = data.numOfFilesDeleted;
            wasSuccessful = true;
            break;
        }

        logger.warn(`Failed to bulk delete images for /media image on attempt #${index}`, error);
        await Timer.wait({ seconds: secondsBetweenRetries });
    }

    if (!wasSuccessful)
    {
        throw new Error(`Failed to bulk delete images for /media image after ${maxNumberOfRetries} attempts. Please triage this issue and ensure that the job is successfully run in a future iteration.`);
    }

    const logMessage = [
        Text.bold('Roll of Darkness Automation'),
        `Finished bulk deleting ${numOfFilesDeleted} images that were ${olderThanInDays}+ days old for /media image!`,
    ].join('\n\n');

    logger.info(`Finished bulk deleting images for /media image!`, { numOfFilesDeleted });
    discordLogger.info(logMessage);
}

catch (error: any)
{
    logger.error(
        'Errors occurred while Roll of Darkness attempted to bulk delete media resources from the file storage microservice',
        error?.response?.data ?? error
    );
    exitCode = 1;
}

// Close out the process faster
finally
{
    let loggerIsFlushed = false, discordLoggerIsFlushed = false;

    // Listen for events for logging being finished
    logger.on('finish', () => {
        loggerIsFlushed = true;
    });

    discordLogger.on('finish', async () => {
        // Add a short delay, otherwise the log won't send via webhook.
        // This seems to be an underlying issue with the discord webhook transport for winston
        await Timer.wait({ seconds: 0.5 });
        discordLoggerIsFlushed = true;
    });

    // Close loggers
    discordLogger.end();
    logger.end();

    // Wait until both loggers are flushed
    await Timer.waitUntilTrue({
        seconds: 0.1,
        callback: () => loggerIsFlushed && discordLoggerIsFlushed,
    });

    // Exit the process
    process.exit(exitCode);
}
