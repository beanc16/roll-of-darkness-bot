import {
    ActionRowBuilder,
    ButtonBuilder,
    StringSelectMenuBuilder,
} from 'discord.js';

export enum FakemonSizeInformationStringSelectCustomIds
{
    EditHeightOrWeight = '✏️ Edit Height/Weight',
}

export enum FakemonSIEditSizeStringSelectElementOptions
{
    Height = 'Height',
    Weight = 'Weight',
}

export class FakemonSIEditSizeStringSelectActionRowBuilder extends ActionRowBuilder<ButtonBuilder>
{
    constructor()
    {
        super({
            components: [
                new StringSelectMenuBuilder({
                    customId: FakemonSizeInformationStringSelectCustomIds.EditHeightOrWeight,
                    placeholder: FakemonSizeInformationStringSelectCustomIds.EditHeightOrWeight,
                    options: Object.values(FakemonSIEditSizeStringSelectElementOptions)
                        .map(option => ({ label: option, value: option })),
                }),
            ],
        });
    }
}
