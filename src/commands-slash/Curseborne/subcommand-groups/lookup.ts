import { SlashCommandSubcommandBuilder } from 'discord.js';

export enum CurseborneLookupSubcommand
{
    Trick = 'trick',
}

export function trick(subcommand: SlashCommandSubcommandBuilder)
{
    subcommand.setName(CurseborneLookupSubcommand.Trick);
    subcommand.setDescription('Get one or more tricks based on the given parameters.');

    // Name
    subcommand.addStringOption((option) => {
        option.setName('trick_name');
        option.setDescription(`The trick's name.`);
        option.setRequired(true);
        return option.setAutocomplete(true);
    });

    return subcommand;
};
