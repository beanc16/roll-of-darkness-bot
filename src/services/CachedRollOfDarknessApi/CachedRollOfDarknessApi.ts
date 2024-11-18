import { RollOfDarknessApi } from '@beanc16/microservices-abstraction';

import { ProbabilityEndpoints } from './ProbabilityEndpoints.js';

export class CachedRollOfDarknessApi extends RollOfDarknessApi
{
    public static probability = ProbabilityEndpoints;
}
