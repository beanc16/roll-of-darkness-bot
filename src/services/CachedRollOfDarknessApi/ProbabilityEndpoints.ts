import { RollOfDarknessApi, RollOfDarknessProbabiltityDiceGetParameters } from '@beanc16/microservices-abstraction';

import { CachedRollOfDarknessApi } from './CachedRollOfDarknessApi.js';
import rollOfDarknessApiHasErrorSingleton from './rollOfDarknessApiHasErrorSingleton.js';

export class ProbabilityEndpoints extends RollOfDarknessApi.probability
{
    public static async getDiceProbability(parameters?: RollOfDarknessProbabiltityDiceGetParameters): Promise<RollOfDarknessProbabiltityDiceGetResponse>
    {
        if (rollOfDarknessApiHasErrorSingleton.get())
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