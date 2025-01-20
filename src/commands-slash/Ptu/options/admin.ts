import { SlashCommandStringOption, SlashCommandSubcommandBuilder } from 'discord.js';

export enum PtuAdminAddSubcommand
{
    Ability = 'ability',
}

const sheetName = (option: SlashCommandStringOption, description: string, isRequired = true): SlashCommandStringOption =>
{
    option.setName('sheet_name');
    option.setDescription(description);

    option.setAutocomplete(true);
    return option.setRequired(isRequired);
};

export const addAbility = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuAdminAddSubcommand.Ability);
    subcommand.setDescription('Add an ability to one or more sheets.');

    subcommand.addStringOption((option) =>
        sheetName(option, 'The name of the sheet to add to.'),
    );

    subcommand.addStringOption((option) =>
    {
        option.setName('name');
        option.setDescription('The name of the ability.');
        return option.setRequired(true);
    });

    subcommand.addStringOption((option) =>
    {
        option.setName('frequency');
        option.setDescription('The frequency of the ability.');
        return option.setRequired(true);
    });

    subcommand.addStringOption((option) =>
    {
        option.setName('effect');
        option.setDescription('The effect of the ability.');
        return option.setRequired(true);
    });

    subcommand.addStringOption((option) =>
    {
        option.setName('trigger');
        return option.setDescription('The trigger of the ability.');
    });

    subcommand.addStringOption((option) =>
    {
        option.setName('target');
        return option.setDescription('The target of the ability.');
    });

    subcommand.addStringOption((option) =>
    {
        option.setName('keywords');
        return option.setDescription('The keywords of the ability.');
    });

    return subcommand;
};
