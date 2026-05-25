import {
    ActionRowBuilder,
    APISelectMenuOption,
    StringSelectMenuBuilder,
} from 'discord.js';

import { PtuFakemonStatus } from '../../../../dal/models/PtuFakemonCollection.js';

export enum FakemonOverviewEditStatusStringSelectCustomIds
{
    EditStatus = 'fakemon-overview-edit-status-selector',
}

export class FakemonOverviewEditStatusActionRowBuilder extends ActionRowBuilder<StringSelectMenuBuilder>
{
    constructor()
    {
        const stringSelectMenu = new StringSelectMenuBuilder({
            customId: FakemonOverviewEditStatusStringSelectCustomIds.EditStatus,
            placeholder: 'Edit Status',
            options: Object.values(PtuFakemonStatus)
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
