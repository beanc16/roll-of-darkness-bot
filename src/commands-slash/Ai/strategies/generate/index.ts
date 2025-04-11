import { GenerateLightNovelTitleStrategy } from './GenerateLightNovelStrategy.js';
import { GeneratePlaygroundStrategy } from './GeneratePlaygroundStrategy.js';
import { GenerateSummaryStrategy } from './GenerateSummaryStrategy.js';

export default {
    [GenerateLightNovelTitleStrategy.key]: GenerateLightNovelTitleStrategy,
    [GeneratePlaygroundStrategy.key]: GeneratePlaygroundStrategy,
    [GenerateSummaryStrategy.key]: GenerateSummaryStrategy,
};
