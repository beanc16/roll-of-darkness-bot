import { logger } from '@beanc16/logger';
import { RollOfDarknessApi } from '@beanc16/microservices-abstraction';

import { ProbabilityEndpoints } from './ProbabilityEndpoints.js';
import rollOfDarknessApiHasErrorSingleton from './rollOfDarknessApiHasErrorSingleton.js';

// @ts-ignore -- TODO: Fix this later
export class CachedRollOfDarknessApi extends RollOfDarknessApi
{
    public static probability = ProbabilityEndpoints;

    private static errorDelay = 900000; // 15 minutes

    public static delayOnError(errorMessage: string, err?: {
        response?: {
            data?: any;
        };
    }): void
    {
        logger.warn(
            errorMessage,
            err?.response?.data || err,
            {
                msUntilNextCall: CachedRollOfDarknessApi.errorDelay,
            },
        );

        rollOfDarknessApiHasErrorSingleton.set(true);
        setTimeout(
            () =>
            {
                rollOfDarknessApiHasErrorSingleton.set(false);
            },
            CachedRollOfDarknessApi.errorDelay,
        );
    }
}
