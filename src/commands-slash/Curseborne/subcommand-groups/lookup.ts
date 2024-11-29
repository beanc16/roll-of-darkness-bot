import { SlashCommandSubcommandBuilder } from 'discord.js';

import { CurseborneCompleteParameterName } from '../types/types.js';

export enum CurseborneLookupSubcommand
{
    Trick = 'trick',
}

export function trick(subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder
{
    subcommand.setName(CurseborneLookupSubcommand.Trick);
    subcommand.setDescription('Get one or more tricks based on the given parameters.');

    // Name
    subcommand.addStringOption((option) =>
    {
        option.setName(CurseborneCompleteParameterName.TrickName);
        option.setDescription(`The trick's name.`);
        option.setRequired(true);
        return option.setAutocomplete(true);
    });

    return subcommand;
};
