import {
    ActionRowBuilder,
    ButtonBuilder,
    StringSelectMenuBuilder,
} from 'discord.js';

import { PtuFakemonCollection } from '../../../../dal/models/PtuFakemonCollection.js';
import { PtuNaturewalk } from '../../../../types/pokemon.js';
import { FakemonCapabilityManagerService } from '../../../../services/FakemonDataManagers/FakemonCapabilityManagerService.js';
import { FakemonCapabilitiesStringSelectCustomIds } from './types.js';

export class FakemonCapabilitiesEditNaturewalkStringSelectActionRowBuilder extends ActionRowBuilder<ButtonBuilder>
{
    constructor(fakemon: Pick<PtuFakemonCollection, 'capabilities'>)
    {
        const naturewalkValues = FakemonCapabilityManagerService.findNaturewalkValues(fakemon);

        super({
            components: [
                new StringSelectMenuBuilder({
                    customId: FakemonCapabilitiesStringSelectCustomIds.EditNaturewalk,
                    placeholder: FakemonCapabilitiesStringSelectCustomIds.EditNaturewalk,
                    options: Object.values(PtuNaturewalk)
                        .map(option => ({
                            label: option,
                            value: option,
                            default: naturewalkValues.includes(option),
                        })),
                    minValues: 0,
                    maxValues: 3,
                }),
            ],
        });
    }
}
