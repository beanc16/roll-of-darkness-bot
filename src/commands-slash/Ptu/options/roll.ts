import { APIApplicationCommandOptionChoice, SlashCommandSubcommandBuilder } from 'discord.js';

import { name, numberOfDice } from '../../Nwod/options/roll.js';
import { dicePool } from '../../options/roll_lite.js';

export enum PtuRollSubcommand
{
    Alchemy = 'alchemy',
    Attack = 'attack',
    Capture = 'capture',
    Skill = 'skill',
}

export enum PtuAlchemyCatalystsAndExtras
{
    OneCatalystLowExtras = '1 Catalyst & 0-1 Extras',
    OneCatalystMidExtras = '1 Catalyst & 2-3 Extras',
    OneCatalystHighExtras = '1 Catalyst & 4-6 Extras',
    TwoCatalystsLowExtras = '2 Catalysts & 0-1 Extras',
    TwoCatalystsMidExtras = '2 Catalysts & 2-3 Extras',
    TwoCatalystsHighExtras = '2 Catalysts & 4-6 Extras',
    ThreeCatalystsLowExtras = '3 Catalysts & 0-1 Extras',
    ThreeCatalystsMidExtras = '3 Catalysts & 2-3 Extras',
    ThreeCatalystsHighExtras = '3 Catalysts & 4-6 Extras',
}

export enum PtuAlchemyActivityAndRest
{
    Exhausted = 'Little rest and heavy activity throughout',
    VeryTired = 'Little rest or much activity throughout',
    Tired = 'Some rest or moderate activity throughout',
    Neutral = 'Some rest or balanced activity throughout',
    Rested = 'Good rest but light activity throughout',
    WellRested = 'Lots of rest and minimal activity',
    ExtremelyRested = 'Fully rested, time spent only alchemizing',
}

export enum PtuAlchemySustenance
{
    Malnourished = 'Malnourished',
    StarvingOrDehydrated = 'Starving or dehydrated throughout',
    SlightlyHungryOrDehydrated = 'Slightly hungry or dehydrated',
    EatingAndDrinkingWell = 'Eating and drinking well',
}

export enum PtuAlchemyTimeOfDay
{
    Horrible = 'Terrible time of day to work',
    NotIdeal = 'Not an ideal time to work',
    Reasonable = 'Reasonable time to work',
    PeakFocus = 'Peak focus time',
}

export enum PtuAlchemyBreaks
{
    NoBreaks = 'Takes no breaks',
    SomeBreaks = 'Takes some short or infrequent breaks',
    ReasonableBreaks = 'Takes enough breaks without overworking',
}

export enum PtuAlchemyLocation
{
    DistractingSpace = 'Working in a distracting space',
    AnySpace = `Working in any space that isn't distracting`,
    YourAlchemyLab = 'Working in your alchemy lab',
}

export enum PtuAlchemyPractice
{
    FirstTime = 'First time working on an item with at least this number of catalysts & extras',
    NotFirstTime = 'Not the first time working on an item with at least this number of catalysts & extras',
}

export const alchemy = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuRollSubcommand.Alchemy);
    subcommand.setDescription('Roll to alchemize an item.');

    // Occult Education Rank
    subcommand.addIntegerOption((option) =>
    {
        option.setName('occult_education_rank');
        option.setDescription('Your Occult Education rank.');
        option.setMinValue(1);
        option.setMaxValue(8);
        option.setRequired(true);
        return option;
    });

    // Catalysts & Extras
    const catalystsAndExtrasChoices = Object.values(PtuAlchemyCatalystsAndExtras).map<APIApplicationCommandOptionChoice<string>>(
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
        option.setName('catalysts_and_extras');
        option.setDescription(`The amount of catalysts and extras that the item has.`);
        option.setChoices(
            ...catalystsAndExtrasChoices,
        );
        return option.setRequired(true);
    });

    // Activity & Rest
    const activityAndRestChoices = Object.values(PtuAlchemyActivityAndRest).map<APIApplicationCommandOptionChoice<string>>(
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
        option.setName('activity_and_rest');
        option.setDescription(`The amount of activity and rest while working on the item.`);
        option.setChoices(
            ...activityAndRestChoices,
        );
        return option.setRequired(true);
    });

    // Sustenance
    const sustenanceChoices = Object.values(PtuAlchemySustenance).map<APIApplicationCommandOptionChoice<string>>(
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
        option.setName('sustenance');
        option.setDescription(`The amount of sustenance while working on the item.`);
        option.setChoices(
            ...sustenanceChoices,
        );
        return option.setRequired(true);
    });

    // Time of Day
    const timeOfDayChoices = Object.values(PtuAlchemyTimeOfDay).map<APIApplicationCommandOptionChoice<string>>(
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
        option.setName('time_of_day');
        option.setDescription(`The time of day while the item is being worked on.`);
        option.setChoices(
            ...timeOfDayChoices,
        );
        return option.setRequired(true);
    });

    // Breaks
    const breakChoices = Object.values(PtuAlchemyBreaks).map<APIApplicationCommandOptionChoice<string>>(
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
        option.setName('breaks');
        option.setDescription(`The length and frequency of breaks throughout working on the item.`);
        option.setChoices(
            ...breakChoices,
        );
        return option.setRequired(true);
    });

    // Location
    const locationChoices = Object.values(PtuAlchemyLocation).map<APIApplicationCommandOptionChoice<string>>(
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
        option.setName('location');
        option.setDescription(`The location used throughout working on the item.`);
        option.setChoices(
            ...locationChoices,
        );
        return option.setRequired(true);
    });

    // Practice
    const practiceChoices = Object.values(PtuAlchemyPractice).map<APIApplicationCommandOptionChoice<string>>(
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
        option.setName('practice');
        option.setDescription(`The amount of experience working on an item of this alchemical difficulty.`);
        option.setChoices(
            ...practiceChoices,
        );
        return option.setRequired(true);
    });

    // Item Name
    subcommand.addStringOption((option) =>
    {
        option.setName('item_name');
        option.setDescription('The name of the item.');
        option.setMinLength(1);
        option.setMaxLength(100);
        return option.setRequired(true);
    });

    // Miscellaneous Modifier
    subcommand.addIntegerOption((option) =>
    {
        option.setName('misc_modifier');
        option.setDescription('Miscellaneous other modifiers.');
        option.setMinValue(-5);
        option.setMaxValue(5);
        return option;
    });

    return subcommand;
};

export const attack = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuRollSubcommand.Attack);
    subcommand.setDescription('Roll to attack with damage.');

    subcommand.addStringOption((oldOption) =>
    {
        const option = dicePool(oldOption);
        return option.setName('damage_dice_pool');
    });

    subcommand.addStringOption(name);

    subcommand.addStringOption((option) =>
    {
        option.setName('accuracy_modifier');
        return option.setDescription('A mathematical formula of extra modifiers (only addition and subtraction are supported; IE: 5 - 10).');
    });

    subcommand.addBooleanOption((option) =>
    {
        option.setName('should_use_max_crit_roll');
        return option.setDescription('Should automatically take the max possible critical hit bonus when auto-criting (default: true).');
    });

    return subcommand;
};

export const capture = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuRollSubcommand.Capture);
    subcommand.setDescription('Roll to capture a Pokémon.');

    subcommand.addIntegerOption((option) =>
    {
        option.setName('trainer_level');
        option.setDescription(`The level of the trainer.`);
        return option.setRequired(true);
    });

    subcommand.addStringOption((option) =>
    {
        option.setName('additional_modifier');
        return option.setDescription('A math formula of extra capture modifiers (only addition and subtraction are supported; IE: 5 - 10)');
    });

    subcommand.addStringOption((option) =>
    {
        option.setName('accuracy_modifier');
        return option.setDescription('A math formula of extra accuracy modifiers (only addition and subtraction are supported; IE: 5 - 10)');
    });

    return subcommand;
};

export const skills = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuRollSubcommand.Skill);
    subcommand.setDescription('Roll a dice pool of d6s with math (only addition and subtraction are supported; IE: 5 - 10).');

    subcommand.addStringOption(numberOfDice);

    subcommand.addStringOption(name);

    subcommand.addStringOption((option) =>
    {
        option.setName('modifier');
        return option.setDescription('A mathematical formula of extra modifiers (only addition and subtraction are supported; IE: 5 - 10).');
    });

    return subcommand;
};
