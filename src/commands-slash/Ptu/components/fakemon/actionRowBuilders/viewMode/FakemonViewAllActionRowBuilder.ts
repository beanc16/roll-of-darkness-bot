import {
    ActionRowBuilder,
    SelectMenuComponentOptionData,
    StringSelectMenuBuilder,
} from 'discord.js';

import type { PtuFakemonCollection } from '../../../../dal/models/PtuFakemonCollection.js';

export enum FakemonViewAllButtonCustomIds
{
    FakemonView = 'fakemon-view-all-fakemon-string-selector-view',
}

export class FakemonViewAllActionRowBuilder extends ActionRowBuilder<StringSelectMenuBuilder>
{
    constructor(fakemon: PtuFakemonCollection[], index: number)
    {
        const options = fakemon.map<SelectMenuComponentOptionData>((curFakemon) => ({
            label: curFakemon.name,
            value: curFakemon.name,
            description: `Status: ${curFakemon.status}`,
        }));

        super({
            components: [
                // TODO: Make this into a stateless paginated string selector (reusable class)
                new StringSelectMenuBuilder({
                    customId: `${FakemonViewAllButtonCustomIds.FakemonView}:${index}`,
                    placeholder: '👀 View Fakemon',
                    options,
                }),
            ],
        });
    }
}
