import { SlashCommandSubcommandBuilder } from 'discord.js';

import * as rollOptions from './roll.js';

export enum NwodRandomSubcommand
{
    GoblinFruit = 'goblin_fruit',
}

export const goblinFruit = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(NwodRandomSubcommand.GoblinFruit);
    subcommand.setDescription('Get a random goblin fruit.');

    subcommand.addIntegerOption((option) =>
    {
        option.setName('dex_or_wits');
        option.setDescription('The number of dots you have in dexterity or wits.');
        option.setMinValue(1);
        option.setMaxValue(10);
        option.setRequired(true);
        return option;
    });

    subcommand.addIntegerOption((option) =>
    {
        option.setName('survival');
        option.setDescription('The number of dots you have in survival.');
        option.setMinValue(1);
        option.setMaxValue(10);
        option.setRequired(true);
        return option;
    });

    subcommand.addStringOption((option) =>
    {
        const newOption = rollOptions.numberOfDice(option);
        newOption.setName('additional_dice');
        return newOption.setRequired(false);
    });

    subcommand.addStringOption(rollOptions.rerolls);
    subcommand.addBooleanOption(rollOptions.rote);

    return subcommand;
};
