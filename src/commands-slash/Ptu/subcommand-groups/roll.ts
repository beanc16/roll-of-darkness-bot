import { SlashCommandSubcommandBuilder } from 'discord.js';

import { dicePool } from '../../options/roll_lite.js';
import { name } from '../../Nwod/options/roll.js';

export enum PtuRollSubcommand
{
    Attack = 'attack',
    Capture = 'capture',
}

export const attack = (subcommand: SlashCommandSubcommandBuilder) =>
{
    subcommand.setName(PtuRollSubcommand.Attack);
    subcommand.setDescription('Roll to attack with damage.');

    subcommand.addStringOption((oldOption) => {
        const option = dicePool(oldOption);
        return option.setName('damage_dice_pool');
    });

    subcommand.addStringOption(name);

    subcommand.addStringOption((option) => {
        option.setName('accuracy_modifier');
        return option.setDescription('A mathematical formula of extra modifiers (only addition and subtraction are supported; IE: 5 - 10).');
    });

    return subcommand;
};

export const capture = (subcommand: SlashCommandSubcommandBuilder) =>
{
    subcommand.setName(PtuRollSubcommand.Capture);
    subcommand.setDescription('Roll to capture a Pokémon.');

    subcommand.addIntegerOption((option) => {
        option.setName('trainer_level');
        option.setDescription(`The level of the trainer.`);
        return option.setRequired(true);
    });

    subcommand.addStringOption((option) => {
        option.setName('additional_modifier');
        return option.setDescription('A mathematical formula of extra modifiers (only addition and subtraction are supported; IE: 5 - 10).');
    });

    return subcommand;
};
