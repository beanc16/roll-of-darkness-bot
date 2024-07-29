import Fuse, { FuseIndexOptions, FuseOptionKey, FuseResult, IFuseOptions } from 'fuse.js';
import { PtuMove } from '../models/PtuMove';

export interface IndexOptions<T>
{
    keys: FuseOptionKey<T>[];
    list: ReadonlyArray<T>;
    options?: FuseIndexOptions<T>;
}

export class SearchService<T>
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
    constructor(array: T[], searchableKeys: FuseOptionKey<T>[], maxAllowedScore: number = 0.8)
    {
        // TODO: Create indices for all searchable things later: https://www.fusejs.io/api/indexing.html#fuse-parseindex
        this.fuse = new Fuse<T>(array, this.generateOptions(searchableKeys)/*, index*/);
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

interface PtuMovesSearchOptions
{
    nameSearch: string | null;
    effectSearch: string | null;
}

export class PtuMovesSearchService
{
    private static searchService?: SearchService<PtuMove>;

    static search(array: PtuMove[], options: PtuMovesSearchOptions)
    {
        // Initialize search service
        const searchableKeys = [
            ...(options.nameSearch ? [{ name: 'name', weight: 1 }] : []),
            ...(options.effectSearch ? [{ name: 'effects', weight: 3 }] : []),
        ];
        const maxAllowedScore = this.getMaxAllowedScore(options);

        this.searchService = new SearchService<PtuMove>(
            array,
            searchableKeys,
            maxAllowedScore
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
