import {
    ActionRowBuilder,
    APISelectMenuOption,
    StringSelectMenuBuilder,
} from 'discord.js';

import { PtuMoveStatus } from '../../../../dal/models/PtuMoveCollection.js';

export enum PtuMoveOverviewEditStatusStringSelectCustomIds
{
    EditStatus = 'ptu-move-overview-edit-status-selector',
}

export class PtuMoveOverviewEditStatusActionRowBuilder extends ActionRowBuilder<StringSelectMenuBuilder>
{
    constructor()
    {
        const stringSelectMenu = new StringSelectMenuBuilder({
            customId: PtuMoveOverviewEditStatusStringSelectCustomIds.EditStatus,
            placeholder: 'Edit Status',
            options: Object.values(PtuMoveStatus)
                .reduce<APISelectMenuOption[]>((acc, cur) =>
                {
                    acc.push({ label: cur, value: cur });
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
