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

const numberOfDice = (option: SlashCommandIntegerOption) =>
{
    options.roll.numberOfDice(option)
    option.setMaxValue(25);
    return option;
}

export const berry = (subcommand: SlashCommandSubcommandBuilder) =>
{
    subcommand.setName('berry');
    subcommand.setDescription('Get a random berry.');
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

export const xItem = (subcommand: SlashCommandSubcommandBuilder) =>
{
    subcommand.setName('x-item');
    subcommand.setDescription('Get a random x-item.');
    subcommand.addIntegerOption(numberOfDice);
    return subcommand;
};
