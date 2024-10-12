import { SlashCommandSubcommandBuilder } from 'discord.js';

export enum PtuRollSubcommand
{
    Capture = 'capture',
}

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
