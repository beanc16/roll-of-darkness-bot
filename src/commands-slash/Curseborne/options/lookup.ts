import { APIApplicationCommandOptionChoice, SlashCommandSubcommandBuilder } from 'discord.js';

import {
    CurseborneAreaEffectSeverity,
    CurseborneAutocompleteParameterName,
    CurseborneEdgeType,
    CurseborneEquipmentType,
    CurseborneStatusType,
    CurseborneTagType,
} from '../types/types.js';

export enum CurseborneLookupSubcommand
{
    AreaEffect = 'area_effect',
    Artifact = 'artifact',
    // DamnationAndInheritance = 'damnation_and_inheritance',
    Edge = 'edge',
    Equipment = 'equipment',
    // GearOrRelic = 'gear_or_relic',
    Motif = 'motif',
    Spell = 'spell',
    SpellAdvance = 'spell_advance',
    Status = 'status',
    Tag = 'tag',
    // Torment = 'torment',
    Trick = 'trick',
}

export function areaEffect(subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder
{
    subcommand.setName(CurseborneLookupSubcommand.AreaEffect);
    subcommand.setDescription('Get one or more area effects based on the given parameters.');

    // Name
    subcommand.addStringOption((option) =>
    {
        option.setName(CurseborneAutocompleteParameterName.AreaEffect);
        option.setDescription(`The area effect's name.`);
        return option.setAutocomplete(true);
    });

    // Severity
    const severityChoices = Object.entries(CurseborneAreaEffectSeverity).map<APIApplicationCommandOptionChoice<string>>(
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
        option.setName('severity');
        option.setDescription(`The area effect's severity.`);
        return option.setChoices(...severityChoices);
    });

    return subcommand;
};

export function artifact(subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder
{
    subcommand.setName(CurseborneLookupSubcommand.Artifact);
    subcommand.setDescription('Get one or more artifacts based on the given parameters.');

    // Name
    subcommand.addStringOption((option) =>
    {
        option.setName(CurseborneAutocompleteParameterName.Artifact);
        option.setDescription(`The artifact's name.`);
        return option.setAutocomplete(true);
    });

    return subcommand;
};

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

export function equipment(subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder
{
    subcommand.setName(CurseborneLookupSubcommand.Equipment);
    subcommand.setDescription('Get one or more equipments based on the given parameters.');

    // Name
    subcommand.addStringOption((option) =>
    {
        option.setName(CurseborneAutocompleteParameterName.EquipmentName);
        option.setDescription(`The equipment's name.`);
        return option.setAutocomplete(true);
    });

    // Type
    const typeChoices = Object.entries(CurseborneEquipmentType).map<APIApplicationCommandOptionChoice<string>>(
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
        option.setDescription(`The equipment's type.`);
        return option.setChoices(...typeChoices);
    });

    // Tag
    subcommand.addStringOption((option) =>
    {
        option.setName(CurseborneAutocompleteParameterName.EquipmentTag);
        option.setDescription(`One of the equipment's tags.`);
        return option.setAutocomplete(true);
    });

    return subcommand;
};

export function motif(subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder
{
    subcommand.setName(CurseborneLookupSubcommand.Motif);
    subcommand.setDescription('Get one or more motifs based on the given parameters.');

    // Name
    subcommand.addStringOption((option) =>
    {
        option.setName(CurseborneAutocompleteParameterName.MotifName);
        option.setDescription(`The motif's name.`);
        return option.setAutocomplete(true);
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

    // Type
    subcommand.addStringOption((option) =>
    {
        option.setName(CurseborneAutocompleteParameterName.SpellType);
        option.setDescription(`One of the types of the spell.`);
        return option.setAutocomplete(true);
    });

    // Attunement
    subcommand.addStringOption((option) =>
    {
        option.setName(CurseborneAutocompleteParameterName.SpellAttunement);
        option.setDescription(`One of the attunements of the spell.`);
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
