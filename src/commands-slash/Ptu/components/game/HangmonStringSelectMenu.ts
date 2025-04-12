import { SelectMenuComponentOptionData, StringSelectMenuBuilder } from 'discord.js';

import { chunkArray } from '../../../../services/chunkArray.js';
import type { PtuPokemonForLookupPokemon } from '../../embed-messages/lookup.js';

export enum PagedStringSelectMenuPageNavigation
{
    Previous = '← Previous',
    Next = 'Next →',
    First = '←← First',
    Last = 'Last →→',
}

export class HangmonStringSelectMenu extends StringSelectMenuBuilder
{
    private MAX_OPTIONS_PER_PAGE = 25;

    private pokemonOptions: SelectMenuComponentOptionData[];
    private index = 0;

    constructor(pokemon: PtuPokemonForLookupPokemon[])
    {
        // Parse options
        const options = pokemon.map<SelectMenuComponentOptionData>((curPokemon) =>
        {
            const typesLabel = (curPokemon.types.length > 1) ? 'Types' : 'Type';

            return {
                label: curPokemon.name,
                value: curPokemon.name,
                description: [
                    `${typesLabel}: ${curPokemon.types.join(' / ')}`,
                    `${curPokemon.metadata.source}`,
                ].join(' | '),
            };
        });

        super({ customId: 'hangmon_selection', placeholder: `Pokemon List - Page 1` });
        this.pokemonOptions = options;
        this.setPage('first');

        // TODO: Add interaction listener that calls callback if a non-pagination option is selected
    }

    private get elementsPerPage(): number
    {
        if (this.numOfPages === 1)
        {
            return this.pokemonOptions.length;
        }

        if (this.numOfPages === 2)
        {
            return this.MAX_OPTIONS_PER_PAGE - 1;
        }

        return this.MAX_OPTIONS_PER_PAGE - 2;
    }

    private get numOfPages(): number
    {
        if (this.pokemonOptions.length <= this.MAX_OPTIONS_PER_PAGE)
        {
            return 1;
        }

        if (this.pokemonOptions.length <= 2 * (this.MAX_OPTIONS_PER_PAGE - 1))
        {
            return 2;
        }

        return Math.ceil(this.pokemonOptions.length / (this.MAX_OPTIONS_PER_PAGE - 2));
    }

    private get pages(): SelectMenuComponentOptionData[][]
    {
        return chunkArray({
            array: this.pokemonOptions,
            shouldMoveToNextChunk: (_, index) => (
                index % this.elementsPerPage === 0
                && index !== 0
            ),
        });
    }

    private get curPage(): SelectMenuComponentOptionData[]
    {
        const mainPage = this.pages[this.index];

        if (this.numOfPages !== 1)
        {
            // 2+ pages, not the last page
            if (this.index !== this.numOfPages - 1 && this.numOfPages >= 2)
            {
                mainPage.push({
                    label: PagedStringSelectMenuPageNavigation.Next,
                    value: PagedStringSelectMenuPageNavigation.Next,
                    description: `Page ${this.index + 2}`,
                });
            }
            // 2+ pages, not the first page
            else if (this.index !== 0 && this.numOfPages >= 2)
            {
                mainPage.unshift({
                    label: PagedStringSelectMenuPageNavigation.Previous,
                    value: PagedStringSelectMenuPageNavigation.Previous,
                    description: `Page ${this.index}`,
                });
            }

            // 3+ pages, the first page
            if (this.index === 0 && this.numOfPages >= 3)
            {
                mainPage.unshift({
                    label: PagedStringSelectMenuPageNavigation.Last,
                    value: PagedStringSelectMenuPageNavigation.Last,
                    description: `Page ${this.numOfPages}`,
                });
            }
            // 3+ pages, the last page
            else if (this.index === this.numOfPages - 1 && this.numOfPages >= 3)
            {
                mainPage.push({
                    label: PagedStringSelectMenuPageNavigation.First,
                    value: PagedStringSelectMenuPageNavigation.First,
                    description: 'Page 1',
                });
            }
        }

        return mainPage;
    }

    public setPage(value: 'previous' | 'next' | 'first' | 'last'): void
    {
        if (value === 'previous')
        {
            this.index -= 1;
        }
        else if (value === 'next')
        {
            this.index += 1;
        }
        else if (value === 'first')
        {
            this.index = 0;
        }
        else if (value === 'last')
        {
            this.index = this.numOfPages - 1;
        }

        this.setOptions(this.curPage);
        this.setPlaceholder(`Pokemon List - Page ${this.index + 1}`);
    }
}
