import { APIApplicationCommandOptionChoice, SlashCommandSubcommandBuilder } from 'discord.js';

import { MeritType } from '../types/types.js';

export enum NwodLookupSubcommand
{
    Merit = 'merit',
}

export const merit = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(NwodLookupSubcommand.Merit);
    subcommand.setDescription('Get a list of merits based on the given parameters.');

    // Name
    subcommand.addStringOption((option) =>
    {
        option.setName('merit_name');
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
