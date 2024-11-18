import { RollOfDarknessApi } from '@beanc16/microservices-abstraction';

import { ProbabilityEndpoints } from './ProbabilityEndpoints.js';

// @ts-ignore -- TODO: Fix this later
export class CachedRollOfDarknessApi extends RollOfDarknessApi
{
    public static probability = ProbabilityEndpoints;
}
