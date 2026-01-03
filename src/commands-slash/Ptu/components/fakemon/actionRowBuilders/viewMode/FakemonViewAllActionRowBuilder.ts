import {
    ActionRowBuilder,
    SelectMenuComponentOptionData,
    StringSelectMenuBuilder,
} from 'discord.js';

import type { PtuFakemonCollection } from '../../../../dal/models/PtuFakemonCollection.js';

export enum FakemonViewAllButtonCustomIds
{
    FakemonView = 'fakemon-view-all-fakemon-string-selector-view',
    FakemonEdit = 'fakemon-view-all-fakemon-string-selector-edit',
}

export class FakemonViewAllActionRowBuilder extends ActionRowBuilder<StringSelectMenuBuilder>
{
    constructor(fakemon: PtuFakemonCollection[], type: 'view' | 'edit')
    {
        const options = fakemon.map<SelectMenuComponentOptionData>((curFakemon) => ({
            label: curFakemon.name,
            value: curFakemon.name,
            description: `Status: ${curFakemon.status}`,
        }));

        const customId = type === 'view' ? FakemonViewAllButtonCustomIds.FakemonView : FakemonViewAllButtonCustomIds.FakemonEdit;
        const placeholder = type === 'view' ? '👀 View Fakemon' : '✏️ Edit Fakemon';

        super({
            components: [
                // TODO: Make this into a stateless paginated string selector (reusable class)
                new StringSelectMenuBuilder({
                    customId,
                    placeholder,
                    options,
                }),
            ],
        });
    }
}
