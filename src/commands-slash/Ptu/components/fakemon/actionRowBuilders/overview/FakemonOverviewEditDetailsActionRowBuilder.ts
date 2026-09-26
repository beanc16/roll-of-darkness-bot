import {
    ActionRowBuilder,
    APISelectMenuOption,
    StringSelectMenuBuilder,
} from 'discord.js';

import { PtuFakemonCollection } from '../../../../dal/models/PtuFakemonCollection.js';
import { regionToDexType } from '../../../../services/FakemonDataManagers/fakemonUtils.js';

export enum FakemonOverviewEditDexNumberStringSelectCustomIds
{
    EditDetails = 'fakemon-overview-edit-dex-number-selector',
}

export class FakemonOverviewEditDexNumberActionRowBuilder extends ActionRowBuilder<StringSelectMenuBuilder>
{
    constructor({ dexType: regionType }: Pick<PtuFakemonCollection, 'dexType'>)
    {
        const dexTypes = regionToDexType[regionType];

        const stringSelectMenu = new StringSelectMenuBuilder({
            customId: FakemonOverviewEditDexNumberStringSelectCustomIds.EditDetails,
            placeholder: 'Edit Dex Number',
            options: Object.values(dexTypes)
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
