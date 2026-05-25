import { discordLogger as DiscordLogger, logger as Logger } from '@beanc16/logger';
import { Timer } from '../../services/Timer/Timer.js';

export async function cleanupLoggers(
    logger: typeof Logger,
    discordLogger: typeof DiscordLogger,
    exitCode: number,
): Promise<void>
{
    let loggerIsFlushed = false;
    let discordLoggerIsFlushed = false;

    // Listen for events for logging being finished
    logger.on('finish', () =>
    {
        loggerIsFlushed = true;
    });

    discordLogger.on('finish', async () =>
    {
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