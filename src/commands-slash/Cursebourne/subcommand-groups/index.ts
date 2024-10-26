import { SlashCommandSubcommandBuilder } from 'discord.js';
import * as rollOptions from './roll.js';

export enum CursebourneSubcommand
{
    Roll = 'roll',
}

export const roll = (subcommand: SlashCommandSubcommandBuilder) =>
{
    subcommand.setName(CursebourneSubcommand.Roll);
    subcommand.setDescription('Run d10s following Cursebourne rules.');

    subcommand.addIntegerOption(rollOptions.numberOfDice);
    subcommand.addStringOption(rollOptions.name);
    subcommand.addIntegerOption(rollOptions.enhancements);
    subcommand.addStringOption(rollOptions.twoSuccesses);
    subcommand.addBooleanOption(rollOptions.secret);

    return subcommand;
};
