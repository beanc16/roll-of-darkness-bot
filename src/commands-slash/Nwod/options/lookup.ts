import { APIApplicationCommandOptionChoice, SlashCommandSubcommandBuilder } from 'discord.js';

import { NwodAutocompleteParameterName } from '../types/lookup.js';
import {
    ChangelingContractType,
    ChangelingTokenType,
    MeritType,
} from '../types/types.js';

export enum NwodLookupSubcommand
{
    Condition = 'condition',
    Contract = 'contract',
    Merit = 'merit',
    Needle = 'needle',
    Thread = 'thread',
    Token = 'token',
}

export const condition = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(NwodLookupSubcommand.Condition);
    subcommand.setDescription('Get a list of conditions based on the given parameters.');

    // Name
    subcommand.addStringOption((option) =>
    {
        option.setName(NwodAutocompleteParameterName.ConditionName);
        option.setDescription(`The condition's name.`);
        option.setRequired(true);
        return option.setAutocomplete(true);
    });

    return subcommand;
};

export const contract = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(NwodLookupSubcommand.Contract);
    subcommand.setDescription('Get a list of contracts based on the given parameters.');

    // Name
    subcommand.addStringOption((option) =>
    {
        option.setName(NwodAutocompleteParameterName.ContractName);
        option.setDescription(`The contract's name.`);
        return option.setAutocomplete(true);
    });

    // Types
    const typeChoices = Object.entries(ChangelingContractType).map<APIApplicationCommandOptionChoice<string>>(
        ([key, value]) =>
        {
            return {
                name: key,
                value,
            };
        },
    );

    for (let index = 1; index <= 2; index += 1)
    {
        subcommand.addStringOption((option) =>
        {
            option.setName(`type_${index}`);
            option.setDescription('The type of contracts to look up.');
            return option.setChoices(
                ...typeChoices,
            );
        });
    }

    return subcommand;
};

export const merit = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(NwodLookupSubcommand.Merit);
    subcommand.setDescription('Get a list of merits based on the given parameters.');

    // Name
    subcommand.addStringOption((option) =>
    {
        option.setName(NwodAutocompleteParameterName.MeritName);
        option.setDescription(`The merit's name.`);
        return option.setAutocomplete(true);
    });

    // Types
    const typeChoices = Object.entries(MeritType).map<APIApplicationCommandOptionChoice<string>>(
        ([key, value]) =>
        {
            return {
                name: key,
                value,
            };
        },
    );

    for (let index = 1; index <= 3; index += 1)
    {
        subcommand.addStringOption((option) =>
        {
            option.setName(`type_${index}`);
            option.setDescription('The type of merits to look up.');
            return option.setChoices(
                ...typeChoices,
            );
        });
    }

    return subcommand;
};

export const needle = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(NwodLookupSubcommand.Needle);
    subcommand.setDescription('Get a list of needles based on the given parameters.');

    // Name
    subcommand.addStringOption((option) =>
    {
        option.setName(NwodAutocompleteParameterName.NeedleName);
        option.setDescription(`The needle's name.`);
        option.setRequired(true);
        return option.setAutocomplete(true);
    });

    return subcommand;
};

export const thread = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(NwodLookupSubcommand.Thread);
    subcommand.setDescription('Get a list of threads based on the given parameters.');

    // Name
    subcommand.addStringOption((option) =>
    {
        option.setName(NwodAutocompleteParameterName.ThreadName);
        option.setDescription(`The thread's name.`);
        option.setRequired(true);
        return option.setAutocomplete(true);
    });

    return subcommand;
};

export const token = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(NwodLookupSubcommand.Token);
    subcommand.setDescription('Get a list of tokens based on the given parameters.');

    // Name
    subcommand.addStringOption((option) =>
    {
        option.setName(NwodAutocompleteParameterName.TokenName);
        option.setDescription(`The token's name.`);
        return option.setAutocomplete(true);
    });

    // Types
    const typeChoices = Object.entries(ChangelingTokenType).map<APIApplicationCommandOptionChoice<string>>(
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
        option.setName(`type`);
        option.setDescription('The type of tokens to look up.');
        return option.setChoices(
            ...typeChoices,
        );
    });

    return subcommand;
};
