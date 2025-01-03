import {
    RollOfDarknessApi,
    RollOfDarknessProbabiltityDiceGetParameters,
    RollOfDarknessProbabiltityDiceGetResponse,
} from '@beanc16/microservices-abstraction';

import { RollOfDarknessApiErrorHandler } from './RollOfDarknessApiErrorHandler.js';
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Fix this later if necessary
        catch (err: any)
        {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- Fix this later if necessary
            RollOfDarknessApiErrorHandler.delayOnError(`Failed to get dice probability for ${process.env.APPLICATION_NAME}. Delaying next call.`, err);
        }

        return {
            cumulative_probability: 0,
            individual_probability: 0,
        };
    }
}
