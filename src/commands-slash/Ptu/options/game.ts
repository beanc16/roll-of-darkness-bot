import type { SlashCommandSubcommandBuilder } from 'discord.js';

export enum PtuGameSubcommand
{
    Hangmon = 'hangmon',
}

export const hangmon = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuGameSubcommand.Hangmon);
    subcommand.setDescription('Hangman minigame where you guess a Pokemon based on various hints.');

    for (let index = 2; index <= 6; index += 1)
    {
        subcommand.addUserOption((option) =>
        {
            option.setName(`player_${index}`);
            option.setDescription('Another user to play with you.');
            return option;
        });
    }

    return subcommand;
};
