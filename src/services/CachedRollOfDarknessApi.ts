import { logger } from '@beanc16/logger';
import { RollOfDarknessApi, RollOfDarknessCategoriesGetResponse, RollOfDarknessFlavorTextGetParameters, RollOfDarknessProbabiltityDiceGetParameters } from '@beanc16/microservices-abstraction';

class CategoriesEndpoints extends RollOfDarknessApi.categories
{
    static async get(): Promise<RollOfDarknessCategoriesGetResponse>
    {
        if (CachedRollOfDarknessApi._hasError)
        {
            return {
                categories: [],
            };
        }

        try
        {
            return await RollOfDarknessApi.categories.get();
        } catch (err: any) {
            CachedRollOfDarknessApi._delayOnError(`Failed to get categories for ${process.env.APPLICATION_NAME}. Delaying next call.`, err);
        }

        return {
            categories: [],
        };
    }
}

class FlavorTextEndpoints extends RollOfDarknessApi.flavorText
{
    static async get(parameters?: RollOfDarknessFlavorTextGetParameters)
    {
        if (CachedRollOfDarknessApi._hasError)
        {
            return {
                flavor_texts: [],
            };
        }

        try
        {
            return await RollOfDarknessApi.flavorText.get(parameters);
        } catch (err: any) {
            CachedRollOfDarknessApi._delayOnError(`Failed to get flavor text for ${process.env.APPLICATION_NAME}. Delaying next call.`, err);
        }

        return {
            flavor_texts: [],
        };
    }
}

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
    static categories = CategoriesEndpoints;
    static flavorText = FlavorTextEndpoints;
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
