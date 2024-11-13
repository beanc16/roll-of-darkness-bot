import { APIApplicationCommandOptionChoice, SlashCommandStringOption } from 'discord.js';

export enum CounterType
{
    Temporary = `Temporary - Can't Be Used After Bot Restart`,
    Permanent = 'Permanent - Can Be Used After Bot Restart',
}

export function name(option: SlashCommandStringOption)
{
    option.setName('name');
    option.setDescription('The name of what the counter is tracking.');
    option.setMinLength(1);
    option.setMaxLength(100);
    option.setRequired(true);
    return option;
}

export function type(option: SlashCommandStringOption)
{
    const choices = Object.values(CounterType).map<APIApplicationCommandOptionChoice<string>>(
        (value) =>
        {
            return {
                name: value,
                value,
            };
        },
    );

    option.setName('type');
    option.setDescription('The type of counter to use (default: Temporary).');
    option.setChoices(
        ...choices,
    );
    return option;
}
