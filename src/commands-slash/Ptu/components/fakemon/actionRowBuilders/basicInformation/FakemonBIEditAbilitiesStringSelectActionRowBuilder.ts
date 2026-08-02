import {
    ActionRowBuilder,
    ButtonBuilder,
    StringSelectMenuBuilder,
} from 'discord.js';

import { FakemonBasicInformationStringSelectCustomIds } from './types.js';

export enum FakemonBIEditAbilitiesStringSelectElementOptions
{
    TwoBasicTwoAdvancedOneHigh = '2 Basic, 2 Advanced, & 1 High',
    OneBasicThreeAdvancedOneHigh = '1 Basic, 3 Advanced, & 1 High',
}

export class FakemonBIEditAbilitiesStringSelectActionRowBuilder extends ActionRowBuilder<ButtonBuilder>
{
    constructor()
    {
        super({
            components: [
                new StringSelectMenuBuilder({
                    customId: FakemonBasicInformationStringSelectCustomIds.EditAbilities,
                    placeholder: FakemonBasicInformationStringSelectCustomIds.EditAbilities,
                    options: Object.values(FakemonBIEditAbilitiesStringSelectElementOptions)
                        .map(option => ({ label: option, value: option })),
                }),
            ],
        });
    }
}
