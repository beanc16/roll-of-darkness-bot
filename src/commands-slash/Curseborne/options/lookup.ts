import { APIApplicationCommandOptionChoice, SlashCommandSubcommandBuilder } from 'discord.js';

import { CurseborneAutocompleteParameterName, CurseborneEdgeType } from '../types/types.js';

export enum CurseborneLookupSubcommand
{
    Edge = 'edge',
    Trick = 'trick',
}

export function edge(subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder
{
    subcommand.setName(CurseborneLookupSubcommand.Edge);
    subcommand.setDescription('Get one or more edges based on the given parameters.');

    // Name
    subcommand.addStringOption((option) =>
    {
        option.setName(CurseborneAutocompleteParameterName.EdgeName);
        option.setDescription(`The edge's name.`);
        return option.setAutocomplete(true);
    });

    // Type
    const typeChoices = Object.entries(CurseborneEdgeType).map<APIApplicationCommandOptionChoice<string>>(
        ([key, value]) =>
        {
            return {
                name: key,
                value,
            };
        },
    );
    subcommand.addStringOption((option) =>
    {
        option.setName('type');
        option.setDescription(`The edge's type.`);
        return option.setChoices(...typeChoices);
    });

    return subcommand;
};

export function trick(subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder
{
    subcommand.setName(CurseborneLookupSubcommand.Trick);
    subcommand.setDescription('Get one or more tricks based on the given parameters.');

    // Name
    subcommand.addStringOption((option) =>
    {
        option.setName(CurseborneAutocompleteParameterName.TrickName);
        option.setDescription(`The trick's name.`);
        option.setRequired(true);
        return option.setAutocomplete(true);
    });

    return subcommand;
};
