const { logger } = require('@beanc16/logger');
const { RollOfDarknessApi } = require('@beanc16/microservices-abstraction');

class CategoriesEndpoints extends RollOfDarknessApi.categories
{
    static async get()
    {
        if (CachedRollOfDarknessApi._hasError)
        {
            return {};
        }

        try
        {
            return await RollOfDarknessApi.categories.get();
        } catch (err) {
            CachedRollOfDarknessApi._delayOnError(`Failed to get categories for ${process.env.APPLICATION_NAME}. Delaying next call.`, err);
        }

        return {};
    }
}

class FlavorTextEndpoints extends RollOfDarknessApi.flavorText
{
    static async get(parameters)
    {
        if (CachedRollOfDarknessApi._hasError)
        {
            return {};
        }

        try
        {
            return await RollOfDarknessApi.flavorText.get(parameters);
        } catch (err) {
            CachedRollOfDarknessApi._delayOnError(`Failed to get flavor text for ${process.env.APPLICATION_NAME}. Delaying next call.`, err);
        }

        return {};
    }
}

class ProbabilityEndpoints extends RollOfDarknessApi.probability
{
    static async getDiceProbability(parameters)
    {
        if (CachedRollOfDarknessApi._hasError)
        {
            return {};
        }

        try
        {
            return await RollOfDarknessApi.probability.getDiceProbability(parameters);
        } catch (err) {
            CachedRollOfDarknessApi._delayOnError(`Failed to get dice probability for ${process.env.APPLICATION_NAME}. Delaying next call.`, err);
        }

        return {};
    }
}

class CachedRollOfDarknessApi extends RollOfDarknessApi
{
    static categories = CategoriesEndpoints;
    static flavorText = FlavorTextEndpoints;
    static probability = ProbabilityEndpoints;

    static _hasError = false;
    static _errorDelay = 900000; // 15 minutes

    static _delayOnError(errorMessage, err)
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



module.exports = CachedRollOfDarknessApi;
