import { ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';

import { PtuFakemonCollection } from '../../../../dal/models/PtuFakemonCollection.js';
import { QrEggGroupsStrategy } from '../../../../strategies/quickReference/QrEggGroupsStrategy.js';
import { FakemonBreedingInformationStringSelectCustomIds } from './types.js';

export class FakemonBreedingInformationEditEggGroupsStringSelectActionRowBuilder extends ActionRowBuilder<StringSelectMenuBuilder>
{
    constructor({ breedingInformation }: Pick<PtuFakemonCollection, 'breedingInformation'>)
    {
        const { eggGroups } = breedingInformation;

        super({
            components: [
                new StringSelectMenuBuilder({
                    customId: FakemonBreedingInformationStringSelectCustomIds.EditEggGroups,
                    placeholder: FakemonBreedingInformationStringSelectCustomIds.EditEggGroups,
                    options: Object.values(QrEggGroupsStrategy.eggGroupDetails)
                        .map(detail => ({
                            label: detail.name,
                            value: detail.name,
                            description: detail.shortDescription,
                            default: eggGroups.includes(detail.name),
                        })),
                    minValues: 0,
                    maxValues: 2,
                }),
            ],
        });
    }
}
