import {
    ActionRowBuilder,
    ButtonBuilder,
    StringSelectMenuBuilder,
} from 'discord.js';

import { PtuFakemonCollection } from '../../../../dal/models/PtuFakemonCollection.js';
import { FakemonCapabilitiesStringSelectCustomIds } from './types.js';

export class FakemonCapabilitiesRemoveOtherCapabilitiesStringSelectActionRowBuilder extends ActionRowBuilder<ButtonBuilder>
{
    constructor(fakemon: Pick<PtuFakemonCollection, 'capabilities'>)
    {
        const other = fakemon.capabilities.other || [];
        // maxValues must be no more the array's length, and that should never exceed 10
        const maxValues = Math.min(other.length, 10);

        super({
            components: [
                new StringSelectMenuBuilder({
                    customId: FakemonCapabilitiesStringSelectCustomIds.RemoveOtherCapabilities,
                    placeholder: FakemonCapabilitiesStringSelectCustomIds.RemoveOtherCapabilities,
                    ...(maxValues > 0
                        ? {
                            // Don't include values unless there's something in the array
                            options: other.map(option => ({
                                label: option,
                                value: option,
                                default: true,
                            })),
                            minValues: 0,
                            maxValues,
                        }
                        : {
                            // If there's nothing, then disable this with at least one value so Discord doesn't throw an error
                            disabled: true,
                            options: [{ label: 'No options available', value: 'None' }],
                        }),
                }),
            ],
        });
    }
}
