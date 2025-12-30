import {
    ActionRowBuilder,
    ButtonBuilder,
    StringSelectMenuBuilder,
} from 'discord.js';

import { FakemonCapabilitiesStringSelectCustomIds } from './types.js';

export enum FakemonCapabilitiesEditCapabilitiesStringSelectElementOptions
{
    MovementCapabilities = 'Edit Movement Capabilities',
    NonMovementCapabilities = 'Edit Non-Movement Capabilities',
    AddOtherCapabilities = 'Add Other Capabilities',
}

export class FakemonCapabilitiesEditCapabilitiesStringSelectActionRowBuilder extends ActionRowBuilder<ButtonBuilder>
{
    constructor()
    {
        super({
            components: [
                new StringSelectMenuBuilder({
                    customId: FakemonCapabilitiesStringSelectCustomIds.EditCapabilities,
                    placeholder: FakemonCapabilitiesStringSelectCustomIds.EditCapabilities,
                    options: Object.values(FakemonCapabilitiesEditCapabilitiesStringSelectElementOptions)
                        .map(option => ({ label: option, value: option })),
                }),
            ],
        });
    }
}
