import type {
    APIApplicationCommandOptionChoice,
    SlashCommandBooleanOption,
    SlashCommandStringOption,
} from 'discord.js';

import { QueuePosition } from '../../../services/Queue.js';

export const fileNameParameter = (option: SlashCommandStringOption): SlashCommandStringOption =>
{
    option.setName('file_name');
    option.setDescription('The name of the file.');
    option.setRequired(true);
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
