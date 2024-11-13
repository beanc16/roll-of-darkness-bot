import Fuse, { FuseIndex } from 'fuse.js';

import { SearchService } from '../../../services/SearchService.js';
import { PtuAbility } from '../models/PtuAbility.js';

interface PtuAbilitiesSearchOptions
{
    nameSearch?: string | null;
    effectSearch?: string | null;
}

export class PtuAbilitiesSearchService
{
    private static searchService?: SearchService<PtuAbility>;
    private static index?: FuseIndex<PtuAbility>; // Speeds up instantiation once created once

    public static search(array: PtuAbility[], options: PtuAbilitiesSearchOptions)
    {
        // Initialize search service parameters
        const searchableKeys = [
            ...(options.nameSearch ? [{ name: 'name', weight: 1 }] : []),
            ...(options.effectSearch ? [{ name: 'effect', weight: 3 }] : []),
        ];
        const maxAllowedScore = this.getMaxAllowedScore(options);

        if (!this.index)
        {
            this.index = Fuse.createIndex(searchableKeys, array);
        }

        this.searchService = new SearchService<PtuAbility>(
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

    private static getMaxAllowedScore(options: PtuAbilitiesSearchOptions)
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
