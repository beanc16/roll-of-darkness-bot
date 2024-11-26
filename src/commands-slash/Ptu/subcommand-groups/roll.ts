import { SlashCommandSubcommandBuilder } from 'discord.js';

import { name } from '../../Nwod/options/roll.js';
import { dicePool } from '../../options/roll_lite.js';

export enum PtuRollSubcommand
{
    Attack = 'attack',
    Capture = 'capture',
}

export const attack = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuRollSubcommand.Attack);
    subcommand.setDescription('Roll to attack with damage.');

    subcommand.addStringOption((oldOption) =>
    {
        const option = dicePool(oldOption);
        return option.setName('damage_dice_pool');
    });

    subcommand.addStringOption(name);

    subcommand.addStringOption((option) =>
    {
        option.setName('accuracy_modifier');
        return option.setDescription('A mathematical formula of extra modifiers (only addition and subtraction are supported; IE: 5 - 10).');
    });

    subcommand.addBooleanOption((option) =>
    {
        option.setName('should_use_max_crit_roll');
        return option.setDescription('Should automatically take the max possible critical hit bonus when auto-criting (default: true).');
    });

    return subcommand;
};

export const capture = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuRollSubcommand.Capture);
    subcommand.setDescription('Roll to capture a Pokémon.');

    subcommand.addIntegerOption((option) =>
    {
        option.setName('trainer_level');
        option.setDescription(`The level of the trainer.`);
        return option.setRequired(true);
    });

    subcommand.addStringOption((option) =>
    {
        option.setName('additional_modifier');
        return option.setDescription('A math formula of extra capture modifiers (only addition and subtraction are supported; IE: 5 - 10)');
    });

    subcommand.addStringOption((option) =>
    {
        option.setName('accuracy_modifier');
        return option.setDescription('A math formula of extra accuracy modifiers (only addition and subtraction are supported; IE: 5 - 10)');
    });

    return subcommand;
};
