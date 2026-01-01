import { ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';

export enum FakemonSkillsStringSelectCustomIds
{
    EditSkill = '✏️ Edit Skill',
}

export enum FakemonSkillsEditStringSelectElementOptions
{
    Acrobatics = 'Acrobatics',
    Athletics = 'Athletics',
    Combat = 'Combat',
    Focus = 'Focus',
    Perception = 'Perception',
    Stealth = 'Stealth',
}

export class FakemonSkillsEditStringSelectActionRowBuilder extends ActionRowBuilder<StringSelectMenuBuilder>
{
    constructor()
    {
        super({
            components: [
                new StringSelectMenuBuilder({
                    customId: FakemonSkillsStringSelectCustomIds.EditSkill,
                    placeholder: FakemonSkillsStringSelectCustomIds.EditSkill,
                    options: Object.values(FakemonSkillsEditStringSelectElementOptions)
                        .map(option => ({ label: option, value: option })),
                }),
            ],
        });
    }
}
