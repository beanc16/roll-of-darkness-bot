import { APIApplicationCommandOptionChoice, SlashCommandSubcommandBuilder } from 'discord.js';
import { ptuCharacterSheetNameChoices, PtuSheetName, ptuSheetNameChoices } from '../types/sheets.js';

export enum PtuAdminSubcommand
{
    Copy = 'copy',
}

export const copy = (subcommand: SlashCommandSubcommandBuilder) =>
{
    subcommand.setName(PtuAdminSubcommand.Copy);
    subcommand.setDescription('Copy Pokémon Data from one sheet to one or more others.');

    subcommand.addStringOption((option) => {
        option.setName('data_sheet');
        option.setDescription('The name of the page to copy data to and from.');

        const choices: APIApplicationCommandOptionChoice<string>[] = [
            {
                name: 'Pokémon Data',
                value: 'Pokémon Data',
            },
        ];
        option.addChoices(...choices);
        return option.setRequired(true);
    });

    subcommand.addStringOption((option) => {
        option.setName('from');
        option.setDescription('The sheet to copy data from.');

        const choices: APIApplicationCommandOptionChoice<string>[] = [
            // Eden
            {
                name: PtuSheetName.EdenWildPokemon,
                value: PtuSheetName.EdenWildPokemon,
            },
            {
                name: PtuSheetName.EdenPokedex,
                value: PtuSheetName.EdenPokedex,
            },
            {
                name: PtuSheetName.EdenNpcOnePagers,
                value: PtuSheetName.EdenNpcOnePagers,
            },

            // General
            {
                name: PtuSheetName.OriginSheet,
                value: PtuSheetName.OriginSheet,
            },
            {
                name: PtuSheetName.BotData,
                value: PtuSheetName.BotData,
            },

            // Character Sheets
            ...ptuCharacterSheetNameChoices,
        ];
        option.addChoices(...choices);
        return option.setRequired(true);
    });

    subcommand.addStringOption((option) => {
        option.setName('to');
        option.setDescription('The sheet(s) to copy data to.');

        option.addChoices(
            ...ptuSheetNameChoices,
            ...ptuCharacterSheetNameChoices,
        );
        return option.setRequired(true);
    });

    return subcommand;
};
