import { APIApplicationCommandOptionChoice, SlashCommandSubcommandBuilder } from 'discord.js';

import { GeistKey, GeistMementoType } from '../types/GeistMemento.js';
import { NwodAutocompleteParameterName } from '../types/lookup.js';
import {
    ChangelingContractType,
    ChangelingGoblinFruitRarity,
    ChangelingTokenType,
    MeritType,
    NwodTiltType,
    NwodWeaponType,
} from '../types/types.js';

export enum NwodLookupSubcommand
{
    Condition = 'condition',
    Contract = 'contract',
    GoblinFruit = 'goblin_fruit',
    Haunt = 'haunt',
    Memento = 'memento',
    Merit = 'merit',
    Needle = 'needle',
    RootAndBloom = 'root_bloom',
    Thread = 'thread',
    Tilt = 'tilt',
    Token = 'token',
    Weapon = 'weapon',
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
        return option.setAutocomplete(true);
    });

    // Name
    subcommand.addStringOption((option) =>
    {
        option.setName(NwodAutocompleteParameterName.ClarityConditionTag);
        option.setDescription(`The condition's clarity tags.`);
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

export const goblinFruit = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(NwodLookupSubcommand.GoblinFruit);
    subcommand.setDescription('Get a list of needles based on the given parameters.');

    // Name
    subcommand.addStringOption((option) =>
    {
        option.setName(NwodAutocompleteParameterName.GoblinFruitName);
        option.setDescription(`The goblin fruit's name.`);
        return option.setAutocomplete(true);
    });

    // Rarity
    const rarityChoices = Object.values(ChangelingGoblinFruitRarity).map<APIApplicationCommandOptionChoice<string>>(
        (value) =>
        {
            return {
                name: value,
                value,
            };
        },
    );
    subcommand.addStringOption((option) =>
    {
        option.setName(`rarity`);
        option.setDescription('The rarity of goblin fruits to look up.');
        return option.setChoices(
            ...rarityChoices,
        );
    });

    return subcommand;
};

export const haunt = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(NwodLookupSubcommand.Haunt);
    subcommand.setDescription('Get a list of haunts based on the given parameters.');

    // Name
    subcommand.addStringOption((option) =>
    {
        option.setName(NwodAutocompleteParameterName.HauntName);
        option.setDescription(`The haunt's name.`);
        option.setRequired(true);
        return option.setAutocomplete(true);
    });

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

export const memento = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(NwodLookupSubcommand.Memento);
    subcommand.setDescription('Get a list of mementos based on the given parameters.');

    // Name
    subcommand.addStringOption((option) =>
    {
        option.setName(NwodAutocompleteParameterName.MementoName);
        option.setDescription(`The memento's name.`);
        return option.setAutocomplete(true);
    });

    // Keys
    const keyChoices = Object.values(GeistKey).map<APIApplicationCommandOptionChoice<string>>(
        (value) =>
        {
            return {
                name: value,
                value,
            };
        },
    );

    subcommand.addStringOption((option) =>
    {
        option.setName('key');
        option.setDescription('The key of mementos to look up.');
        return option.setChoices(
            ...keyChoices,
        );
    });

    // Types
    const typeChoices = Object.values(GeistMementoType).map<APIApplicationCommandOptionChoice<string>>(
        (value) =>
        {
            return {
                name: value,
                value,
            };
        },
    );

    subcommand.addStringOption((option) =>
    {
        option.setName('type');
        option.setDescription('The type of mementos to look up.');
        return option.setChoices(
            ...typeChoices,
        );
    });

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

export const rootAndBloom = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(NwodLookupSubcommand.RootAndBloom);
    subcommand.setDescription('Get a list of root and blooms based on the given parameters.');

    // Name
    subcommand.addStringOption((option) =>
    {
        option.setName(NwodAutocompleteParameterName.RootAndBloomName);
        option.setDescription(`The root or bloom's name.`);
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

export const tilt = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(NwodLookupSubcommand.Tilt);
    subcommand.setDescription('Get a list of tilts based on the given parameters.');

    // Name
    subcommand.addStringOption((option) =>
    {
        option.setName(NwodAutocompleteParameterName.TiltName);
        option.setDescription(`The tilt's name.`);
        return option.setAutocomplete(true);
    });

    // Types
    const typeChoices = Object.entries(NwodTiltType).map<APIApplicationCommandOptionChoice<string>>(
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
        option.setDescription('The type of tilts to look up.');
        return option.setChoices(
            ...typeChoices,
        );
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

export const weapon = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(NwodLookupSubcommand.Weapon);
    subcommand.setDescription('Get a list of weapons based on the given parameters.');

    // Name
    subcommand.addStringOption((option) =>
    {
        option.setName(NwodAutocompleteParameterName.WeaponName);
        option.setDescription(`The weapon's name.`);
        return option.setAutocomplete(true);
    });

    // Types
    const typeChoices = Object.entries(NwodWeaponType).map<APIApplicationCommandOptionChoice<string>>(
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
        option.setDescription('The type of weapons to look up.');
        return option.setChoices(
            ...typeChoices,
        );
    });

    return subcommand;
};
