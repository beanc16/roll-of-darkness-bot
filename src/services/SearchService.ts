import Fuse, {
    FuseIndex,
    FuseOptionKey,
    FuseResult,
    IFuseOptions,
} from 'fuse.js';

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
    constructor(array: T[], searchableKeys: FuseOptionKey<T>[], maxAllowedScore: number = 0.8, index?: FuseIndex<T>)
    {
        this.fuse = new Fuse<T>(
            array,
            SearchService.generateOptions(searchableKeys),
            index,
        );
        this.MAX_ALLOWED_SCORE = maxAllowedScore;
    }

    public search(key: string): T[]
    {
        const results = this.fuse.search(key);
        return this.parseOutput(results);
    }

    public searchBulk(keys: string[]): T[]
    {
        const key = keys.join(this.OPERATORS.OR);
        return this.search(key);
    }

    private static generateOptions<T>(searchableKeys: FuseOptionKey<T>[]): IFuseOptions<T>
    {
        return {
            includeScore: true,
            keys: searchableKeys,
        };
    }

    private parseOutput(results: FuseResult<T>[]): T[]
    {
        return results.reduce((acc, {
            item,
            score,
        }) =>
        {
            if (score && score <= this.MAX_ALLOWED_SCORE)
            {
                acc.push(item);
            }

            return acc;
        }, [] as T[]);
    }
}
