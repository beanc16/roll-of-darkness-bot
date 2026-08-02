import type { SlashCommandSubcommandBuilder } from 'discord.js';

import { PtuAutocompleteParameterName } from '../types/autocomplete.js';

export enum PtuGameSubcommand
{
    Hangmon = 'hangmon',
    Oracle_Create = 'oracle_create',
    Oracle_Continue = 'oracle_continue',
    Oracle_View = 'oracle_view',
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

export const oracleCreate = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuGameSubcommand.Oracle_Create);
    subcommand.setDescription('Oracle deck minigame where you gain insight on the past, present, and future based on Pokemon gods.');

    subcommand.addStringOption((option) =>
    {
        option.setName('name');
        option.setDescription('The name of the game.');
        return option.setRequired(true);
    });

    for (let index = 1; index <= 9; index += 1)
    {
        subcommand.addUserOption((option) =>
        {
            option.setName(`player_${index}`);
            option.setDescription('A player in the game.');

            if (index <= 2)
            {
                option.setRequired(true);
            }

            return option;
        });
    }

    return subcommand;
};

export const oracleContinue = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuGameSubcommand.Oracle_Continue);
    subcommand.setDescription('Oracle deck minigame where you gain insight on the past, present, and future based on Pokemon gods.');

    subcommand.addStringOption((option) =>
    {
        option.setName(PtuAutocompleteParameterName.OracleGameName);
        option.setDescription('The name of the game.');
        option.setRequired(true);
        return option.setAutocomplete(true);
    });

    return subcommand;
};

export const oracleView = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuGameSubcommand.Oracle_View);
    subcommand.setDescription(`View turns of Oracle deck minigames you've been a part of.`);

    subcommand.addStringOption((option) =>
    {
        option.setName(PtuAutocompleteParameterName.OracleGameName);
        option.setDescription('The name of the game.');
        option.setRequired(true);
        return option.setAutocomplete(true);
    });

    return subcommand;
};
