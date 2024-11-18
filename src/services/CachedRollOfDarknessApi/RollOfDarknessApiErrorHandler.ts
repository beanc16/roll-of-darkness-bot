import { logger } from '@beanc16/logger';

import rollOfDarknessApiHasErrorSingleton from './rollOfDarknessApiHasErrorSingleton.js';

export class RollOfDarknessApiErrorHandler
{
    private static errorDelay = 900000; // 15 minutes

    public static delayOnError(errorMessage: string, err?: {
        response?: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Fix this type later if necessary.
            data?: any;
        };
    }): void
    {
        logger.warn(
            errorMessage,
            err?.response?.data || err,
            {
                msUntilNextCall: this.errorDelay,
            },
        );

        rollOfDarknessApiHasErrorSingleton.set(true);
        setTimeout(
            () =>
            {
                rollOfDarknessApiHasErrorSingleton.set(false);
            },
            this.errorDelay,
        );
    }
}
