import {
    ActionRowBuilder,
    APISelectMenuOption,
    StringSelectMenuBuilder,
} from 'discord.js';

import { PaginatedStringSelectMenu } from '../../../../shared/components/PaginatedStringSelectMenu.js';
import { PtuPokemonForLookupPokemon } from '../../../embed-messages/lookup.js';
import { FakemonInteractionManagerPage } from '../../../services/FakemonInteractionManagerService/FakemonInteractionManagerService.js';
import { FakemonSelectorCustomIds } from '../types.js';


export class FakemonOverviewActionRowBuilder extends ActionRowBuilder<PaginatedStringSelectMenu<PtuPokemonForLookupPokemon>>
{
    constructor()
    {
        const stringSelectMenu = new StringSelectMenuBuilder({
            customId: FakemonSelectorCustomIds.Overview,
            placeholder: 'Edit...',
            options: Object.values(FakemonInteractionManagerPage)
                .reduce<APISelectMenuOption[]>((acc, cur) =>
                {
                    if (cur !== FakemonInteractionManagerPage.Overview)
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
