import { logger } from '@beanc16/logger';
import { RollOfDarknessApi, RollOfDarknessProbabiltityDiceGetParameters } from '@beanc16/microservices-abstraction';

class ProbabilityEndpoints extends RollOfDarknessApi.probability
{
    public static async getDiceProbability(parameters?: RollOfDarknessProbabiltityDiceGetParameters)
    {
        if (CachedRollOfDarknessApi.hasError)
        {
            return {
                cumulative_probability: 0,
                individual_probability: 0,
            };
        }

        try
        {
            return await RollOfDarknessApi.probability.getDiceProbability(parameters);
        }
        catch (err: any)
        {
            CachedRollOfDarknessApi.delayOnError(`Failed to get dice probability for ${process.env.APPLICATION_NAME}. Delaying next call.`, err);
        }

        return {
            cumulative_probability: 0,
            individual_probability: 0,
        };
    }
}

// @ts-ignore -- TODO: Fix this later
export class CachedRollOfDarknessApi extends RollOfDarknessApi
{
    public static probability = ProbabilityEndpoints;

    public static hasError = false;
    private static errorDelay = 900000; // 15 minutes

    public static delayOnError(errorMessage: string, err?: {
        response?: {
            data?: any;
        };
    })
    {
        logger.warn(
            errorMessage,
            err?.response?.data || err,
            {
                msUntilNextCall: CachedRollOfDarknessApi.errorDelay,
            },
        );

        CachedRollOfDarknessApi.hasError = true;
        setTimeout(
            () =>
            {
                CachedRollOfDarknessApi.hasError = false;
            },
            CachedRollOfDarknessApi.errorDelay,
        );
    }
}
