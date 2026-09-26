import {
    ActionRowBuilder,
    APISelectMenuOption,
    StringSelectMenuBuilder,
} from 'discord.js';

export enum FakemonOverviewEditDetailsStringSelectCustomIds
{
    EditDetails = 'fakemon-overview-edit-details-selector',
}

export enum FakemonOverviewEditDetailsStringSelectElementOptions
{
    EditName = 'Edit Name',
}

export class FakemonOverviewEditDetailsActionRowBuilder extends ActionRowBuilder<StringSelectMenuBuilder>
{
    constructor()
    {
        const stringSelectMenu = new StringSelectMenuBuilder({
            customId: FakemonOverviewEditDetailsStringSelectCustomIds.EditDetails,
            placeholder: 'Edit Details',
            options: Object.values(FakemonOverviewEditDetailsStringSelectElementOptions)
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
