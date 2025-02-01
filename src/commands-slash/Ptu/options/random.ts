import { SlashCommandIntegerOption, SlashCommandSubcommandBuilder } from 'discord.js';

import { BerryTier } from '../types/PtuBerry.js';

export enum HealingAndStatusOption
{
    HealingAndStatus = 'healing_and_status',
    Healing = 'healing',
    Status = 'status',
}

export enum PtuRandomSubcommand
{
    Apricorn = 'apricorn',
    Berry = 'berry',
    DowsingRod = 'dowsing_rod',
    EvolutionaryStone = 'evolutionary_stone',
    Fortune = 'fortune',
    HealingItem = 'healing_item',
    HeldItem = 'held_item',
    HiddenPower = 'hidden_power',
    Metronome = 'metronome',
    Mushroom = 'mushroom',
    Nature = 'nature',
    Pickup = 'pickup',
    Pokeball = 'pokeball',
    TM = 'tm',
    Vitamin = 'vitamin',
    XItem = 'x-item',
};

const numberOfDice = (option: SlashCommandIntegerOption): SlashCommandIntegerOption =>
{
    option.setName('number_of_dice');
    option.setDescription('The number of dice to roll');
    option.setMinValue(1);
    option.setMaxValue(25);
    option.setRequired(true);
    return option;
};

// const numberOfIterations = (option: SlashCommandIntegerOption) =>
// {
//     option.setName('number_of_iterations');
//     option.setDescription('The number of times to roll (default: 1)');
//     option.setMinValue(1);
//     option.setMaxValue(50);
//     return option;
// };

export const apricorn = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuRandomSubcommand.Apricorn);
    subcommand.setDescription('Get a random Apricorn.');
    // TODO: Add number of iterations
    // subcommand.addIntegerOption(numberOfIterations);
    subcommand.addIntegerOption((option) =>
    {
        option.setName('survival_rank');
        option.setDescription('Your Survival rank.');
        option.setMinValue(1);
        option.setMaxValue(8);
        option.setRequired(true);
        return option;
    });
    return subcommand;
};

export const berry = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuRandomSubcommand.Berry);
    subcommand.setDescription('Get one or more random berries.');
    subcommand.addIntegerOption(numberOfDice);
    subcommand.addStringOption((option) =>
    {
        option.setName('berry_tier');
        option.setDescription('The tier of berries to roll for (default: 1+)');
        return option.setChoices(
            {
                name: '1+',
                value: BerryTier.OnePlus,
            },
            {
                name: '1',
                value: BerryTier.One,
            },
            {
                name: '2+',
                value: BerryTier.TwoPlus,
            },
            {
                name: '2',
                value: BerryTier.Two,
            },
            {
                name: '3',
                value: BerryTier.Three,
            },
        );
    });
    return subcommand;
};

export const dowsingRod = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuRandomSubcommand.DowsingRod);
    subcommand.setDescription('Get a random item using a Dowsing Rod.');
    // TODO: Add number of iterations
    // subcommand.addIntegerOption(numberOfIterations);
    subcommand.addIntegerOption((option) =>
    {
        option.setName('occult_education_rank');
        option.setDescription('Your Occult Education rank.');
        option.setMinValue(1);
        option.setMaxValue(8);
        option.setRequired(true);
        return option;
    });
    subcommand.addBooleanOption((option) =>
    {
        option.setName('has_crystal_resonance');
        return option.setDescription('You have the Crystal Resonance Feature (default: false)');
    });
    subcommand.addBooleanOption((option) =>
    {
        option.setName('has_skill_stunt_dowsing');
        return option.setDescription('You have the Skill Stunt (Dowsing) Edge (default: false)');
    });
    subcommand.addBooleanOption((option) =>
    {
        option.setName('is_sandy_or_rocky');
        return option.setDescription(`You're searching in a sandy or rocky area (default: false)`);
    });
    return subcommand;
};

export const evolutionaryStone = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuRandomSubcommand.EvolutionaryStone);
    subcommand.setDescription('Get one or more random evolutionary stones.');
    subcommand.addIntegerOption(numberOfDice);
    return subcommand;
};

export const fortune = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuRandomSubcommand.Fortune);
    subcommand.setDescription('Get a random amount of money using the Fortune capability.');

    subcommand.addIntegerOption((option) =>
    {
        option.setName('level');
        option.setDescription('The level of your Pokemon with the Fortune capability.');
        option.setMinValue(1);
        option.setMaxValue(100);
        option.setRequired(true);
        return option;
    });
    return subcommand;
};

export const healingItem = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuRandomSubcommand.HealingItem);
    subcommand.setDescription('Get one or more random healing/status items.');
    subcommand.addIntegerOption(numberOfDice);
    subcommand.addStringOption((option) =>
    {
        option.setName('type');
        option.setDescription('The type of healing/status item to roll for (default: Healing & Status)');
        return option.setChoices(
            {
                name: 'Healing & Status',
                value: HealingAndStatusOption.HealingAndStatus,
            },
            {
                name: 'Healing',
                value: HealingAndStatusOption.Healing,
            },
            {
                name: 'Status',
                value: HealingAndStatusOption.Status,
            },
        );
    });
    return subcommand;
};

export const heldItem = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuRandomSubcommand.HeldItem);
    subcommand.setDescription('Get one or more random held items.');
    subcommand.addIntegerOption(numberOfDice);
    subcommand.addBooleanOption((option) =>
    {
        option.setName('include_mega');
        return option.setDescription('Include mega stone in potential results (default: false)');
    });
    subcommand.addBooleanOption((option) =>
    {
        option.setName('include_badges');
        return option.setDescription('Include badges in potential results (default: false)');
    });
    return subcommand;
};

export const hiddenPower = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuRandomSubcommand.HiddenPower);
    subcommand.setDescription('Get a random type for the HIdden Power move.');
    return subcommand;
};

export const metronome = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuRandomSubcommand.Metronome);
    subcommand.setDescription('Get a random move using the Metronome move.');
    return subcommand;
};

export const mushroom = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuRandomSubcommand.Mushroom);
    subcommand.setDescription('Get a random mushroom item using the Mushroom Gathering capability.');

    subcommand.addIntegerOption((option) =>
    {
        option.setName('pokemon_level');
        option.setDescription('The level of your Pokemon with the Mushroom Gathering capability.');
        option.setMinValue(1);
        option.setMaxValue(100);
        option.setRequired(true);
        return option;
    });
    return subcommand;
};

export const nature = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuRandomSubcommand.Nature);
    subcommand.setDescription('Get a random nature.');
    subcommand.addIntegerOption((option) =>
    {
        const diceOption = numberOfDice(option);
        diceOption.setDescription('The number of dice to roll (default: 1)');
        return diceOption.setRequired(false);
    });
    return subcommand;
};

export const pickup = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuRandomSubcommand.Pickup);
    subcommand.setDescription('Get a random item using the Pickup ability.');
    // subcommand.addIntegerOption(numberOfDice);
    return subcommand;
};

export const pokeball = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuRandomSubcommand.Pokeball);
    subcommand.setDescription('Get one or more random pokeballs.');
    subcommand.addIntegerOption(numberOfDice);
    subcommand.addBooleanOption((option) =>
    {
        option.setName('include_special');
        return option.setDescription('Include premier and cherish balls in potential results (default: false)');
    });
    subcommand.addBooleanOption((option) =>
    {
        option.setName('include_safari');
        return option.setDescription('Include sport and park balls in potential results (default: false)');
    });
    subcommand.addBooleanOption((option) =>
    {
        option.setName('include_jailbreaker');
        return option.setDescription('Include jailbroken balls in potential results (default: false)');
    });
    subcommand.addBooleanOption((option) =>
    {
        option.setName('include_cases');
        return option.setDescription('Include pokeballs in cases in potential results (default: false)');
    });
    subcommand.addBooleanOption((option) =>
    {
        option.setName('include_attachments');
        return option.setDescription('Include pokeballs in attachments in potential results (default: false)');
    });
    subcommand.addBooleanOption((option) =>
    {
        option.setName('include_master');
        return option.setDescription('Include master balls in potential results (default: false)');
    });
    return subcommand;
};

export const xItem = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuRandomSubcommand.XItem);
    subcommand.setDescription('Get one or more random x-items.');
    subcommand.addIntegerOption(numberOfDice);
    return subcommand;
};

export const tm = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuRandomSubcommand.TM);
    subcommand.setDescription('Get one or more random TMs/HMs.');
    subcommand.addIntegerOption(numberOfDice);
    return subcommand;
};

export const vitamin = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuRandomSubcommand.Vitamin);
    subcommand.setDescription('Get one or more random vitamins.');
    subcommand.addIntegerOption(numberOfDice);
    return subcommand;
};
