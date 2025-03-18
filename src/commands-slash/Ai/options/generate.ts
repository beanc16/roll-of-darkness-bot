import { SlashCommandSubcommandBuilder } from 'discord.js';

import { promptOption } from './sharedOptions.js';

export enum AiGenerateSubcommand
{
    Playground = 'playground',
}

export const playground = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName('playground');
    subcommand.setDescription('Generate a response with a simple system and user message.');

    subcommand.addStringOption((option) =>
    {
        option.setName('system_instructions');
        option.setDescription('The set of pre-defined guidelines that the AI should use to shape its behavior and responses.');

        return option;
    });
    subcommand.addStringOption((option) =>
    {
        return promptOption(option, { description: 'Your prompt.', isRequired: false });
    });

    return subcommand;
};
