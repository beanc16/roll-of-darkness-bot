import type {
    APIApplicationCommandOptionChoice,
    SlashCommandBooleanOption,
    SlashCommandStringOption,
} from 'discord.js';

import { QueuePosition } from '../../../services/Queue/Queue.js';

export const fileNameParameter = (option: SlashCommandStringOption, index?: number): SlashCommandStringOption =>
{
    option.setName(
        index !== undefined
            ? `file_name_${index}`
            : 'file_name',
    );
    option.setDescription('The name of the file.');
    option.setAutocomplete(true);

    if (index === undefined || index === 1)
    {
        option.setRequired(true);
    }
    return option;
};

export const queuePosition = (option: SlashCommandStringOption): SlashCommandStringOption =>
{
    option.setName('queue_position');
    option.setDescription(`The position of the file in the queue (default: ${QueuePosition.Last}).`);

    const choices = Object.values(QueuePosition).map<APIApplicationCommandOptionChoice<string>>(
        (name) =>
        {
            return {
                name,
                value: name,
            };
        },
    );
    return option.addChoices(...choices);
};

export const shouldLoop = (option: SlashCommandBooleanOption): SlashCommandBooleanOption =>
{
    option.setName('should_loop');
    return option.setDescription('Should loop the audio (default: False).');
};
