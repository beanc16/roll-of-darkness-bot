import {
    ActionRowBuilder,
    APISelectMenuOption,
    StringSelectMenuBuilder,
} from 'discord.js';

import { MoveInteractionManagerPage } from '../../../../services/MoveInteractionManagerService/types.js';

export enum PtuMoveOverviewStringSelectCustomIds
{
    Navigation = 'ptu-move-overview-navigation-selector',
}

export class PtuMoveOverviewNavigationActionRowBuilder extends ActionRowBuilder<StringSelectMenuBuilder>
{
    constructor(curPage: MoveInteractionManagerPage)
    {
        const stringSelectMenu = new StringSelectMenuBuilder({
            customId: PtuMoveOverviewStringSelectCustomIds.Navigation,
            placeholder: 'Navigate to...',
            options: Object.values(MoveInteractionManagerPage)
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
