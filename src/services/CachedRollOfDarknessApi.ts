import { logger } from '@beanc16/logger';
import { RollOfDarknessApi, RollOfDarknessProbabiltityDiceGetParameters } from '@beanc16/microservices-abstraction';

class ProbabilityEndpoints extends RollOfDarknessApi.probability
{
    static async getDiceProbability(parameters?: RollOfDarknessProbabiltityDiceGetParameters)
    {
        if (CachedRollOfDarknessApi._hasError)
        {
            return {
                cumulative_probability: 0,
                individual_probability: 0,
            };
        }

        try
        {
            return await RollOfDarknessApi.probability.getDiceProbability(parameters);
        } catch (err: any) {
            CachedRollOfDarknessApi._delayOnError(`Failed to get dice probability for ${process.env.APPLICATION_NAME}. Delaying next call.`, err);
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
    static probability = ProbabilityEndpoints;

    static _hasError = false;
    static _errorDelay = 900000; // 15 minutes

    static _delayOnError(errorMessage: string, err?: {
        response?: {
            data?: any;
        };
    })
    {
        logger.warn(
            errorMessage,
            err?.response?.data || err,
            {
                msUntilNextCall: CachedRollOfDarknessApi._errorDelay
            },
        );

        CachedRollOfDarknessApi._hasError = true;
        setTimeout(
            () =>
            {
                CachedRollOfDarknessApi._hasError = false;
            },
            CachedRollOfDarknessApi._errorDelay
        );
    }
}
