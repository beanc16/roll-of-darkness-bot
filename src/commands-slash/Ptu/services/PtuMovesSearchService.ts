import Fuse, { FuseIndex } from 'fuse.js';

import { SearchService } from '../../../services/SearchService.js';
import { PtuMove } from '../models/PtuMove.js';

interface PtuMovesSearchOptions
{
    nameSearch?: string | null;
    effectSearch?: string | null;
}

export class PtuMovesSearchService
{
    private static searchService?: SearchService<PtuMove>;
    private static index?: FuseIndex<PtuMove>; // Speeds up instantiation once created once

    public static search(array: PtuMove[], options: PtuMovesSearchOptions)
    {
        // Initialize search service parameters
        const searchableKeys = [
            ...(options.nameSearch ? [{ name: 'name', weight: 1 }] : []),
            ...(options.effectSearch ? [{ name: 'effects', weight: 3 }] : []),
        ];
        const maxAllowedScore = this.getMaxAllowedScore(options);

        if (!this.index)
        {
            this.index = Fuse.createIndex(searchableKeys, array);
        }

        this.searchService = new SearchService<PtuMove>(
            array,
            searchableKeys,
            maxAllowedScore,
            this.index,
        );

        // Search
        const keysToSearch = [
            ...(options.nameSearch ? [options.nameSearch] : []),
            ...(options.effectSearch ? [options.effectSearch] : []),
        ];

        return this.searchService.searchBulk(keysToSearch);
    }

    private static getMaxAllowedScore(options: PtuMovesSearchOptions)
    {
        // Name & Effect
        if (options.nameSearch && options.effectSearch)
        {
            return 0.5;
        }

        // Name
        if (options.nameSearch && !options.effectSearch)
        {
            return 0.3;
        }

        // Effect
        return 0.3;
    }
}
