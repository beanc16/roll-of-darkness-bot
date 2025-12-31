import {
    ActionRowBuilder,
    APISelectMenuOption,
    StringSelectMenuBuilder,
} from 'discord.js';

import { PaginatedStringSelectMenu } from '../../../../shared/components/PaginatedStringSelectMenu.js';
import { PtuPokemonForLookupPokemon } from '../../../embed-messages/lookup.js';
import { FakemonInteractionManagerPage } from '../../../services/FakemonInteractionManagerService/types.js';

export enum FakemonOverviewStringSelectCustomIds
{
    Navigation = 'fakemon-overview-navigation-selector',
}

export class FakemonOverviewActionRowBuilder extends ActionRowBuilder<PaginatedStringSelectMenu<PtuPokemonForLookupPokemon>>
{
    constructor(curPage: FakemonInteractionManagerPage)
    {
        const stringSelectMenu = new StringSelectMenuBuilder({
            customId: FakemonOverviewStringSelectCustomIds.Navigation,
            placeholder: 'Navigate to...',
            options: Object.values(FakemonInteractionManagerPage)
                .reduce<APISelectMenuOption[]>((acc, cur) =>
                {
                    if (cur !== curPage)
                    {
                        acc.push({ label: cur, value: cur });
                    }
                    return acc;
                }, []),
        });

        super({
            components: [
                stringSelectMenu,
            ],
        });
    }
}
