import Fuse, { FuseIndex, FuseOptionKey, FuseResult, IFuseOptions } from 'fuse.js';
import { PtuMove } from '../models/PtuMove';
import { PtuAbility } from '../models/PtuAbility';

class SearchService<T>
{
    private fuse: Fuse<T>;
    private readonly MAX_ALLOWED_SCORE: number;
    private readonly OPERATORS = {
        AND: ' ',
        OR: ' | ',
    };

    /**
     * @param searchableKeys - Nested keys in an object.
     * @example // Example payload
     * const array = [
     *     {
     *         "title": "Old Man's War",
     *         "author": "John Scalzi",
     *         "tags": ["fiction"]
     *     },
     *     {
     *         "title": "The Lock Artist",
     *         "author": "Steve Hamilton",
     *         "tags": ["thriller"]
     *     },
     * ]
     * 
     * // Example function signature
     * const searchService = new SearchService(array, ['author.tags.value'])
     */
    constructor(array: T[], searchableKeys: FuseOptionKey<T>[], maxAllowedScore: number = 0.8, index?: FuseIndex<T>)
    {
        this.fuse = new Fuse<T>(
            array,
            this.generateOptions(searchableKeys),
            index
        );
        this.MAX_ALLOWED_SCORE = maxAllowedScore;
    }

    search(key: string)
    {
        const results = this.fuse.search(key);
        return this.parseOutput(results);
    }

    searchBulk(keys: string[])
    {
        const key = keys.join(this.OPERATORS.OR);
        return this.search(key);
    }

    private generateOptions(searchableKeys: FuseOptionKey<T>[]): IFuseOptions<T>
    {
        return {
            includeScore: true,
            keys: searchableKeys,
        };
    }

    private parseOutput(results: FuseResult<T>[])
    {
        return results.reduce((acc, { item, score }) => {
            if (score && score <= this.MAX_ALLOWED_SCORE)
            {
                acc.push(item);
            }

            return acc;
        }, [] as T[]);
    }
}

interface PtuAbilitiesSearchOptions
{
    nameSearch?: string | null;
    effectSearch?: string | null;
}

export class PtuAbilitiesSearchService
{
    private static searchService?: SearchService<PtuAbility>;
    private static index?: FuseIndex<PtuAbility>; // Speeds up instantiation once created once

    static search(array: PtuAbility[], options: PtuAbilitiesSearchOptions)
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
            this.index
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
        else if (options.nameSearch && !options.effectSearch)
        {
            return 0.3;
        }

        // Effect
        return 0.3;
    }
}

interface PtuMovesSearchOptions
{
    nameSearch?: string | null;
    effectSearch?: string | null;
}

export class PtuMovesSearchService
{
    private static searchService?: SearchService<PtuMove>;
    private static index?: FuseIndex<PtuMove>; // Speeds up instantiation once created once

    static search(array: PtuMove[], options: PtuMovesSearchOptions)
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
            this.index
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
        else if (options.nameSearch && !options.effectSearch)
        {
            return 0.3;
        }

        // Effect
        return 0.3;
    }
}
