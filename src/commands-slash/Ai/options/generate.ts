import { SlashCommandSubcommandBuilder } from 'discord.js';

import { promptOption } from './sharedOptions.js';

export enum AiGenerateSubcommand
{
    LightNovelSummary = 'light_novel_summary',
    Summary = 'summary',
}

export const lightNovelSummary = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(AiGenerateSubcommand.LightNovelSummary);
    subcommand.setDescription('Generate a light novel title that summarizes anything.');

    subcommand.addStringOption((option) =>
    {
        return promptOption(option, { commandName: AiGenerateSubcommand.LightNovelSummary });
    });

    return subcommand;
};

export const summary = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(AiGenerateSubcommand.Summary);
    subcommand.setDescription('Generate a summary of anything.');

    subcommand.addStringOption((option) =>
    {
        return promptOption(option, {
            commandName: AiGenerateSubcommand.Summary,
            description: 'The text to summarize.',
            isRequired: true,
        });
    });

    return subcommand;
};
