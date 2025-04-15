import Fuse, { FuseIndex } from 'fuse.js';

import { SearchService } from '../../../services/SearchService.js';
import { PtuMove } from '../models/PtuMove.js';

interface PtuMovesSearchOptions
{
    nameSearch?: string | null;
    rangeSearch?: string | null;
    effectSearch?: string | null;
}

export class PtuMovesSearchService
{
    private static searchService?: SearchService<PtuMove>;
    private static index?: FuseIndex<PtuMove>; // Speeds up instantiation once created once

    public static search(array: PtuMove[], options: PtuMovesSearchOptions): PtuMove[]

    {
        // Initialize search service parameters
        const searchableKeys = [
            ...(options.nameSearch ? [{ name: 'name', weight: 1 }] : []),
            ...(options.rangeSearch ? [{ name: 'range', weight: 1 }] : []),
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
            ...(options.rangeSearch ? [options.rangeSearch] : []),
            ...(options.effectSearch ? [options.effectSearch] : []),
        ];

        return this.searchService.searchBulk(keysToSearch);
    }

    private static getMaxAllowedScore(options: PtuMovesSearchOptions): number
    {
        // 2-3 are present
        if ([options.nameSearch, options.rangeSearch, options.effectSearch].filter(Boolean).length >= 2)
        {
            return 0.5;
        }

        // Only 1 is present
        return 0.3;
    }
}
