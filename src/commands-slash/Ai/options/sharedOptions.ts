import { SlashCommandStringOption } from 'discord.js';

export const promptOption = (option: SlashCommandStringOption, {
    commandName,
    description,
    isRequired = true,
}: {
    commandName?: string;
    description?: string;
    isRequired?: boolean;
}): SlashCommandStringOption =>
{
    option.setName('prompt');
    option.setDescription(description ?? `The prompt to generate the ${commandName?.replaceAll('_', ' ')}.`);
    return option.setRequired(isRequired);
};
