import { APIApplicationCommandOptionChoice, SlashCommandSubcommandBuilder } from 'discord.js';

import { equalityOption } from '../../options/shared.js';
import { PtuAutocompleteParameterName } from '../types/autocomplete.js';
import { PokeballType } from '../types/pokeballType.js';
import {
    PokemonStat,
    PokemonStatusType,
    PtuAbilityListType,
    PtuContestStatEffect,
    PtuContestStatType,
    PtuMoveFrequency,
    PtuMoveListType,
} from '../types/pokemon.js';
import { BerryTier } from '../types/PtuBerry.js';
import { PtuEquipmentSlot } from '../types/PtuEquipment.js';
import { HealingItemType } from '../types/PtuHealingItem.js';
import { HeldItemType } from '../types/PtuHeldItem.js';
import { PtuKeyItemType } from '../types/PtuKeyItem.js';
import { PtuVitaminEnhancedStat } from '../types/PtuVitamin.js';
import {
    pokemonMoveCategoryOption,
    pokemonMoveNameOption,
    pokemonTypeOption,
} from './shared.js';

export enum PtuLookupSubcommand
{
    Ability = 'ability',
    Aura = 'aura',
    Berry = 'berry',
    Capability = 'capability',
    Class = 'class',
    Edge = 'edge',
    Equipment = 'equipment',
    EvolutionaryStone = 'evolutionary_stone',
    Feature = 'feature',
    GiftBlessing = 'gift_blessing',
    Hazard = 'hazard',
    HealingItem = 'healing_item',
    HeldItem = 'held_item',
    KeyItem = 'key_item',
    Keyword = 'keyword',
    Move = 'move',
    Nature = 'nature',
    Pokeball = 'pokeball',
    Pokemon = 'pokemon',
    Status = 'status',
    Tag = 'tag',
    Terrain = 'terrain',
    Tm = 'tm',
    Vitamin = 'vitamin',
    Weather = 'weather',
    XItem = 'x_item',
}

export const ability = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuLookupSubcommand.Ability);
    subcommand.setDescription('Get a list of abilities based on the given parameters.');

    // Name
    subcommand.addStringOption((option) =>
    {
        option.setName(PtuAutocompleteParameterName.AbilityName);
        option.setDescription(`The ability's name.`);
        return option.setAutocomplete(true);
    });

    // Searches
    subcommand.addStringOption((option) =>
    {
        option.setName('name_search');
        return option.setDescription(`A search on the ability's name.`);
    });

    subcommand.addStringOption((option) =>
    {
        option.setName('frequency_search');
        return option.setDescription(`A search on the ability's frequency.`);
    });

    subcommand.addStringOption((option) =>
    {
        option.setName('effect_search');
        return option.setDescription(`A search on the ability's effect.`);
    });

    return subcommand;
};

export const aura = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuLookupSubcommand.Aura);
    subcommand.setDescription('Get an aura based on the given parameters.');

    // Name
    subcommand.addStringOption((option) =>
    {
        option.setName(PtuAutocompleteParameterName.AuraName);
        option.setDescription(`The aura's name.`);
        return option.setAutocomplete(true);
    });

    // User's Name
    subcommand.addStringOption((option) =>
    {
        option.setName(PtuAutocompleteParameterName.AuraUserName);
        option.setDescription(`The name of the user of the aura.`);
        return option.setAutocomplete(true);
    });

    return subcommand;
};

export const berry = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuLookupSubcommand.Berry);
    subcommand.setDescription('Get a berry based on the given parameters.');

    // Name
    subcommand.addStringOption((option) =>
    {
        option.setName(PtuAutocompleteParameterName.BerryName);
        option.setDescription(`The berry's name.`);
        return option.setAutocomplete(true);
    });

    // Tier
    const choices = Object.values(BerryTier).map<APIApplicationCommandOptionChoice<string>>(
        (name) =>
        {
            return {
                name,
                value: name,
            };
        },
    );
    subcommand.addStringOption((option) =>
    {
        option.setName('tier');
        option.setDescription(`The berry's tier.`);
        return option.addChoices(...choices);
    });

    return subcommand;
};

export const capability = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuLookupSubcommand.Capability);
    subcommand.setDescription('Get a capability based on the given parameters.');

    // Name
    subcommand.addStringOption((option) =>
    {
        option.setName(PtuAutocompleteParameterName.CapabilityName);
        option.setDescription(`The capability's name.`);
        option.setRequired(true);
        return option.setAutocomplete(true);
    });

    return subcommand;
};

// Can't call this "class" since that's a reserved word
export const classCommand = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuLookupSubcommand.Class);
    subcommand.setDescription('Get the features of a class based on the given parameters.');

    // Name
    subcommand.addStringOption((option) =>
    {
        option.setName(PtuAutocompleteParameterName.ClassName);
        option.setDescription(`The class' name.`);
        option.setRequired(true);
        return option.setAutocomplete(true);
    });

    return subcommand;
};

export const edge = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuLookupSubcommand.Edge);
    subcommand.setDescription('Get a edge based on the given parameters.');

    // Name
    subcommand.addStringOption((option) =>
    {
        option.setName(PtuAutocompleteParameterName.EdgeName);
        option.setDescription(`The edge's name.`);
        option.setRequired(true);
        return option.setAutocomplete(true);
    });

    return subcommand;
};

export const equipment = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuLookupSubcommand.Equipment);
    subcommand.setDescription('Get equipment based on the given parameters.');

    // Name
    subcommand.addStringOption((option) =>
    {
        option.setName(PtuAutocompleteParameterName.EquipmentName);
        option.setDescription(`The equipment's name.`);
        return option.setAutocomplete(true);
    });

    // Slot
    const slotChoices = Object.values(PtuEquipmentSlot).map<APIApplicationCommandOptionChoice<string>>(
        (name) =>
        {
            return {
                name,
                value: name,
            };
        },
    );
    subcommand.addStringOption((option) =>
    {
        option.setName('slot');
        option.setDescription(`The equipment's slot.`);
        return option.addChoices(...slotChoices);
    });

    return subcommand;
};

export const evolutionaryStone = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuLookupSubcommand.EvolutionaryStone);
    subcommand.setDescription('Get an evolutionary stone based on the given parameters.');

    // Name
    subcommand.addStringOption((option) =>
    {
        option.setName(PtuAutocompleteParameterName.EvolutionaryStone);
        option.setDescription(`The evolutionary stone's name.`);
        return option.setAutocomplete(true);
    });

    // Pokemon To Evolve
    subcommand.addStringOption((option) =>
    {
        option.setName(PtuAutocompleteParameterName.PokemonToEvolve);
        option.setDescription(`The name of the Pokemon to evolve.`);
        return option.setAutocomplete(true);
    });

    return subcommand;
};

export const feature = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuLookupSubcommand.Feature);
    subcommand.setDescription('Get a feature based on the given parameters.');

    // Name
    subcommand.addStringOption((option) =>
    {
        option.setName(PtuAutocompleteParameterName.FeatureName);
        option.setDescription(`The feature's name.`);
        option.setRequired(true);
        return option.setAutocomplete(true);
    });

    return subcommand;
};

export const giftBlessing = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuLookupSubcommand.GiftBlessing);
    subcommand.setDescription('Get a legendary gift / blessing based on the given parameters.');

    // Name
    subcommand.addStringOption((option) =>
    {
        option.setName(PtuAutocompleteParameterName.GiftBlessingName);
        option.setDescription(`The legendary gift's / blessing's name.`);
        return option.setAutocomplete(true);
    });

    // Patron
    subcommand.addStringOption((option) =>
    {
        option.setName(PtuAutocompleteParameterName.GiftBlessingPatron);
        option.setDescription(`The legendary gift's / blessing's patron.`);
        return option.setAutocomplete(true);
    });

    return subcommand;
};

export const hazard = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuLookupSubcommand.Hazard);
    subcommand.setDescription('Get hazards based on the given parameters.');

    // Name
    subcommand.addStringOption((option) =>
    {
        option.setName(PtuAutocompleteParameterName.HazardName);
        option.setDescription(`The hazard's name.`);
        return option.setAutocomplete(true);
    });

    // Move name
    subcommand.addStringOption((option) =>
    {
        option.setName(PtuAutocompleteParameterName.MoveName);
        option.setDescription(`The hazard's associated move name to search.`);
        return option.setAutocomplete(true);
    });

    // Ability name
    subcommand.addStringOption((option) =>
    {
        option.setName(PtuAutocompleteParameterName.AbilityName);
        option.setDescription(`The hazard's associated ability name to search.`);
        return option.setAutocomplete(true);
    });

    return subcommand;
};

export const healingItem = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuLookupSubcommand.HealingItem);
    subcommand.setDescription('Get a healing item based on the given parameters.');

    // Name
    subcommand.addStringOption((option) =>
    {
        option.setName(PtuAutocompleteParameterName.HealingItem);
        option.setDescription(`The healing item's name.`);
        return option.setAutocomplete(true);
    });

    // Type
    const typeChoices = Object.entries(HealingItemType).map<APIApplicationCommandOptionChoice<string>>(
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
        option.setDescription('The type of healing items to look up.');
        return option.setChoices(
            ...typeChoices,
        );
    });

    return subcommand;
};

export const heldItem = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuLookupSubcommand.HeldItem);
    subcommand.setDescription('Get a held item based on the given parameters.');

    // Name
    subcommand.addStringOption((option) =>
    {
        option.setName(PtuAutocompleteParameterName.HeldItem);
        option.setDescription(`The held item's name.`);
        return option.setAutocomplete(true);
    });

    // Type
    const typeChoices = Object.entries(HeldItemType).map<APIApplicationCommandOptionChoice<string>>(
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
        option.setDescription('The type of held items to look up.');
        return option.setChoices(
            ...typeChoices,
        );
    });

    return subcommand;
};

export const keyItem = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuLookupSubcommand.KeyItem);
    subcommand.setDescription('Get a key item based on the given parameters.');

    // Name
    subcommand.addStringOption((option) =>
    {
        option.setName(PtuAutocompleteParameterName.KeyItemName);
        option.setDescription(`The key item's name.`);
        return option.setAutocomplete(true);
    });

    // Type
    const typeChoices = Object.values(PtuKeyItemType).map<APIApplicationCommandOptionChoice<string>>(
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
        option.setDescription('The type of moves to look up.');
        return option.setChoices(
            ...typeChoices,
        );
    });

    return subcommand;
};

export const keyword = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuLookupSubcommand.Keyword);
    subcommand.setDescription('Get a keyword based on the given parameters.');

    // Name
    subcommand.addStringOption((option) =>
    {
        option.setName(PtuAutocompleteParameterName.KeywordName);
        option.setDescription(`The keyword's name.`);
        option.setRequired(true);
        return option.setAutocomplete(true);
    });

    return subcommand;
};

export const move = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuLookupSubcommand.Move);
    subcommand.setDescription('Get a list of moves based on the given parameters.');

    // Name
    subcommand.addStringOption((option) =>
    {
        return pokemonMoveNameOption(option, `The move's name.`);
    });

    // Type
    subcommand.addStringOption((option) =>
    {
        return pokemonTypeOption(option, 'The type of moves to look up.');
    });

    // Move Category
    subcommand.addStringOption((option) =>
    {
        return pokemonMoveCategoryOption(option, 'The category of moves to look up.');
    });

    // Damage Base
    subcommand.addIntegerOption((option) =>
    {
        option.setName('damage_base');
        option.setDescription('The damage base of moves to look up.');
        option.setMinValue(1);
        option.setMaxValue(28);
        return option;
    });
    subcommand.addStringOption(option =>
        equalityOption(option)
            .setName('damage_base_equality')
            .setDescription('The provided DB should be ??? to the moves DB (default: Equals)'));

    // Frequency
    const frequencyChoices = Object.values(PtuMoveFrequency).map<APIApplicationCommandOptionChoice<string>>(
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
        option.setName('frequency');
        option.setDescription('The frequency of moves to look up.');
        return option.setChoices(
            ...frequencyChoices,
        );
    });

    // AC
    subcommand.addIntegerOption((option) =>
    {
        option.setName('ac');
        option.setDescription('The AC of moves to look up.');
        option.setMinValue(0);
        option.setMaxValue(10);
        return option;
    });
    subcommand.addStringOption((option) =>
    {
        const newOption = equalityOption(option);
        newOption.setName('ac_equality');
        newOption.setDescription('The provided AC should be ??? to the moves AC (default: Equals)');
        return newOption;
    });

    // Contest Stats
    const contestStatTypeChoices = Object.values(PtuContestStatType).map<APIApplicationCommandOptionChoice<string>>(
        (value) =>
        {
            return {
                name: value,
                value,
            };
        },
    );
    const contestStatEffectChoices = Object.values(PtuContestStatEffect).map<APIApplicationCommandOptionChoice<string>>(
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
        option.setName('contest_stat_type');
        option.setDescription('The contest stat type of moves to look up.');
        return option.setChoices(
            ...contestStatTypeChoices,
        );
    });
    subcommand.addStringOption((option) =>
    {
        option.setName('contest_stat_effect');
        option.setDescription('The contest stat effect of moves to look up.');
        return option.setChoices(
            ...contestStatEffectChoices,
        );
    });
    subcommand.addBooleanOption((option) =>
    {
        option.setName('include_contest_stats');
        option.setDescription('Whether contest stats should be included in the output (default: False).');
        return option;
    });

    // Based On
    subcommand.addStringOption((option) =>
    {
        const newOption = pokemonMoveNameOption(option, `Moves based on the given name.`);
        return newOption.setName(PtuAutocompleteParameterName.BasedOn);
    });

    // Searches
    subcommand.addStringOption((option) =>
    {
        option.setName('name_search');
        return option.setDescription(`A search on the move's name.`);
    });

    subcommand.addStringOption((option) =>
    {
        option.setName('range_search');
        return option.setDescription(`A search on the move's range.`);
    });

    subcommand.addStringOption((option) =>
    {
        option.setName('effect_search');
        return option.setDescription(`A search on the move's effect.`);
    });

    return subcommand;
};

export const nature = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuLookupSubcommand.Nature);
    subcommand.setDescription('Get a list of natures based on the given parameters.');

    // Name
    subcommand.addStringOption((option) =>
    {
        option.setName(PtuAutocompleteParameterName.NatureName);
        option.setDescription(`The nature's name.`);
        return option.setAutocomplete(true);
    });

    const statChoices = Object.entries(PokemonStat).map<APIApplicationCommandOptionChoice<string>>(
        ([key, value]) =>
        {
            return {
                name: key,
                value,
            };
        },
    );

    // Raised Stat
    subcommand.addStringOption((option) =>
    {
        option.setName('raised_stat');
        option.setDescription(`The stat that the nature raises.`);
        return option.setChoices(
            ...statChoices,
        );
    });

    // Lowered Stat
    subcommand.addStringOption((option) =>
    {
        option.setName('lowered_stat');
        option.setDescription(`The stat that the nature lowers.`);
        return option.setChoices(
            ...statChoices,
        );
    });

    return subcommand;
};

export const pokeball = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuLookupSubcommand.Pokeball);
    subcommand.setDescription('Get a pokeball based on the given parameters.');

    // Name
    subcommand.addStringOption((option) =>
    {
        option.setName(PtuAutocompleteParameterName.PokeballName);
        option.setDescription(`The pokeball's name.`);
        return option.setAutocomplete(true);
    });

    // Type
    subcommand.addStringOption((option) =>
    {
        option.setName('type');
        option.setDescription(`The type of pokeballs.`);
        const choices = Object.values(PokeballType).map<APIApplicationCommandOptionChoice<string>>(
            (name) =>
            {
                return {
                    name,
                    value: name,
                };
            },
        );
        return option.addChoices(...choices);
    });

    return subcommand;
};

export const pokemon = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuLookupSubcommand.Pokemon);
    subcommand.setDescription('Get a Pokémon based on the given parameters.');

    // Name
    subcommand.addStringOption((option) =>
    {
        option.setName(PtuAutocompleteParameterName.PokemonName);
        option.setDescription(`The Pokémon's name.`);
        return option.setAutocomplete(true);
    });

    // Move name
    subcommand.addStringOption((option) =>
    {
        option.setName(PtuAutocompleteParameterName.MoveName);
        option.setDescription(`The move's name to search.`);
        return option.setAutocomplete(true);
    });

    // Move search type
    const moveListTypeChoices = Object.entries(PtuMoveListType).map<APIApplicationCommandOptionChoice<string>>(
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
        option.setName('move_list_type');
        option.setDescription('The type of search to do on the move list (defaut: all).');
        option.setChoices(
            ...moveListTypeChoices,
        );
        return option;
    });

    // Ability name
    subcommand.addStringOption((option) =>
    {
        option.setName(PtuAutocompleteParameterName.AbilityName);
        option.setDescription(`The ability's name to search.`);
        return option.setAutocomplete(true);
    });

    // Ability search type
    const abilityListTypeChoices = Object.entries(PtuAbilityListType).map<APIApplicationCommandOptionChoice<string>>(
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
        option.setName('ability_list_type');
        option.setDescription('The type of search to do on the ability list (defaut: all).');
        option.setChoices(
            ...abilityListTypeChoices,
        );
        return option;
    });

    // Capability name
    subcommand.addStringOption((option) =>
    {
        option.setName(PtuAutocompleteParameterName.CapabilityName);
        option.setDescription(`The capability's name.`);
        return option.setAutocomplete(true);
    });

    // Base Stat Total
    subcommand.addIntegerOption((option) =>
    {
        option.setName('base_stat_total');
        option.setDescription(`The base stat total of the Pokémon.`);
        option.setMinValue(1);
        option.setMaxValue(74);
        return option;
    });

    // Move contest stats
    subcommand.addBooleanOption((option) =>
    {
        option.setName('include_contest_info');
        return option.setDescription('Include move contest stats (default: False)');
    });

    return subcommand;
};

export const status = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuLookupSubcommand.Status);
    subcommand.setDescription('Get a status based on the given parameters.');

    // Name
    subcommand.addStringOption((option) =>
    {
        option.setName(PtuAutocompleteParameterName.StatusName);
        option.setDescription(`The status' name.`);
        return option.setAutocomplete(true);
    });

    // Type
    const typeChoices = Object.entries(PokemonStatusType).map<APIApplicationCommandOptionChoice<string>>(
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
        option.setName('status_type');
        option.setDescription(`The status' type.`);
        return option.setChoices(
            ...typeChoices,
        );
    });

    return subcommand;
};

export const tag = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuLookupSubcommand.Tag);
    subcommand.setDescription('Get a tag based on the given parameters.');

    // Name
    subcommand.addStringOption((option) =>
    {
        option.setName(PtuAutocompleteParameterName.TagName);
        option.setDescription(`The tag's name.`);
        option.setRequired(true);
        return option.setAutocomplete(true);
    });

    return subcommand;
};

/*
export const terrain = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuLookupSubcommand.Terrain);
    subcommand.setDescription('Get terrain based on the given parameters.');

    // Name
    subcommand.addStringOption((option) =>
    {
        option.setName(PtuAutocompleteParameterName.TerrainName);
        option.setDescription(`The terrain's name.`);
        return option.setAutocomplete(true);
    });

    return subcommand;
};
*/

export const tm = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuLookupSubcommand.Tm);
    subcommand.setDescription('Get a tm based on the given parameters.');

    // Name
    subcommand.addStringOption((option) =>
    {
        option.setName(PtuAutocompleteParameterName.TmName);
        option.setDescription(`The tm's name.`);
        option.setRequired(true);
        return option.setAutocomplete(true);
    });

    return subcommand;
};

export const vitamin = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuLookupSubcommand.Vitamin);
    subcommand.setDescription('Get a vitamin based on the given parameters.');

    // Name
    subcommand.addStringOption((option) =>
    {
        option.setName(PtuAutocompleteParameterName.VitaminName);
        option.setDescription(`The vitamin's name.`);
        return option.setAutocomplete(true);
    });

    // Enhanced Stat
    const enhancedStatChoices = Object.values(PtuVitaminEnhancedStat).map<APIApplicationCommandOptionChoice<string>>(
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
        option.setName('enhanced_stat');
        option.setDescription(`The stat the vitamin enhances.`);
        return option.setChoices(
            ...enhancedStatChoices,
        );
    });

    return subcommand;
};

export const weather = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuLookupSubcommand.Weather);
    subcommand.setDescription('Get weather based on the given parameters.');

    // Name
    subcommand.addStringOption((option) =>
    {
        option.setName(PtuAutocompleteParameterName.WeatherName);
        option.setDescription(`The weather's name.`);
        return option.setAutocomplete(true);
    });

    return subcommand;
};

export const xItem = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuLookupSubcommand.XItem);
    subcommand.setDescription('Get an x-item based on the given parameters.');

    // Name
    subcommand.addStringOption((option) =>
    {
        option.setName(PtuAutocompleteParameterName.XItemName);
        option.setDescription(`The x-item's name.`);
        return option.setAutocomplete(true);
    });

    return subcommand;
};
