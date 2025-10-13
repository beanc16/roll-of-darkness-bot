import { APIApplicationCommandOptionChoice, SlashCommandSubcommandBuilder } from 'discord.js';

import {
    CurseborneAutocompleteParameterName,
    CurseborneEdgeType,
    CurseborneStatusType,
    CurseborneTagType,
} from '../types/types.js';

export enum CurseborneLookupSubcommand
{
    Edge = 'edge',
    Spell = 'spell',
    SpellAdvance = 'spell_advance',
    Status = 'status',
    Tag = 'tag',
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

export function spell(subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder
{
    subcommand.setName(CurseborneLookupSubcommand.Spell);
    subcommand.setDescription('Get one or more spells based on the given parameters.');

    // Name
    subcommand.addStringOption((option) =>
    {
        option.setName(CurseborneAutocompleteParameterName.SpellName);
        option.setDescription(`The spell's name.`);
        return option.setAutocomplete(true);
    });

    // Available to
    subcommand.addStringOption((option) =>
    {
        option.setName(CurseborneAutocompleteParameterName.SpellAvailableTo);
        option.setDescription(`One of the groups that the spell is available to.`);
        return option.setAutocomplete(true);
    });

    return subcommand;
};

export function spellAdvance(subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder
{
    subcommand.setName(CurseborneLookupSubcommand.SpellAdvance);
    subcommand.setDescription('Get one or more spell advances based on the given parameters.');

    // Name
    subcommand.addStringOption((option) =>
    {
        option.setName(CurseborneAutocompleteParameterName.SpellAdvanceName);
        option.setDescription(`The spell advance's name.`);
        return option.setAutocomplete(true);
    });

    // Spell Name
    subcommand.addStringOption((option) =>
    {
        option.setName(CurseborneAutocompleteParameterName.SpellName);
        option.setDescription(`The spell advance's associated spell.`);
        return option.setAutocomplete(true);
    });

    return subcommand;
};

export function status(subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder
{
    subcommand.setName(CurseborneLookupSubcommand.Status);
    subcommand.setDescription('Get one or more statuses based on the given parameters.');

    // Name
    subcommand.addStringOption((option) =>
    {
        option.setName(CurseborneAutocompleteParameterName.StatusName);
        option.setDescription(`The status' name.`);
        return option.setAutocomplete(true);
    });

    // Type
    const typeChoices = Object.entries(CurseborneStatusType).map<APIApplicationCommandOptionChoice<string>>(
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
        option.setDescription(`The status' type.`);
        return option.setChoices(...typeChoices);
    });

    return subcommand;
};

export function tag(subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder
{
    subcommand.setName(CurseborneLookupSubcommand.Tag);
    subcommand.setDescription('Get one or more tags based on the given parameters.');

    // Name
    subcommand.addStringOption((option) =>
    {
        option.setName(CurseborneAutocompleteParameterName.TagName);
        option.setDescription(`The tag's name.`);
        return option.setAutocomplete(true);
    });

    // Type
    const typeChoices = Object.entries(CurseborneTagType).map<APIApplicationCommandOptionChoice<string>>(
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
        option.setDescription(`The tag's type.`);
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
        return option.setAutocomplete(true);
    });

    // Tags
    subcommand.addStringOption((option) =>
    {
        option.setName(CurseborneAutocompleteParameterName.TrickTag);
        option.setDescription(`One of the trick's tags.`);
        return option.setAutocomplete(true);
    });

    return subcommand;
};
