import { SlashCommandIntegerOption, SlashCommandSubcommandBuilder } from 'discord.js';
import * as options from '../../../options';

export enum BerryTier
{
    OnePlus = 'one_plus',
    One = 'one',
    TwoPlus = 'two_plus',
    Two = 'two',
    Three = 'three',
}

export enum PtuRandomSubcommand
{
    Berry = 'berry',
    EvolutionaryStone = 'evolutionary_stone',
    XItem = 'x-item',
    TM = 'tm',
    Vitamin = 'vitamin',
};

const numberOfDice = (option: SlashCommandIntegerOption) =>
{
    options.roll.numberOfDice(option)
    option.setMaxValue(25);
    return option;
}

export const berry = (subcommand: SlashCommandSubcommandBuilder) =>
{
    subcommand.setName(PtuRandomSubcommand.Berry);
    subcommand.setDescription('Get one or more random berries.');
    subcommand.addIntegerOption(numberOfDice);
    subcommand.addStringOption((option) => {
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

export const evolutionaryStones = (subcommand: SlashCommandSubcommandBuilder) =>
{
    subcommand.setName(PtuRandomSubcommand.EvolutionaryStone);
    subcommand.setDescription('Get one or more random evolutionary stones.');
    subcommand.addIntegerOption(numberOfDice);
    return subcommand;
};

export const xItem = (subcommand: SlashCommandSubcommandBuilder) =>
{
    subcommand.setName(PtuRandomSubcommand.XItem);
    subcommand.setDescription('Get one or more random x-items.');
    subcommand.addIntegerOption(numberOfDice);
    return subcommand;
};

export const tm = (subcommand: SlashCommandSubcommandBuilder) =>
{
    subcommand.setName(PtuRandomSubcommand.TM);
    subcommand.setDescription('Get one or more random TMs/HMs.');
    subcommand.addIntegerOption(numberOfDice);
    return subcommand;
};

export const vitamin = (subcommand: SlashCommandSubcommandBuilder) =>
{
    subcommand.setName(PtuRandomSubcommand.Vitamin);
    subcommand.setDescription('Get one or more random vitamins.');
    subcommand.addIntegerOption(numberOfDice);
    return subcommand;
};
