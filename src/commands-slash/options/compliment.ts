import { APIApplicationCommandOptionChoice, SlashCommandStringOption, SlashCommandUserOption } from 'discord.js';

export enum ComplimentType
{
    Basic = 'Basic',
    Beat = 'Beat',
}

export function friend(option: SlashCommandUserOption)
{
    option.setName('friend');
    option.setDescription(`The person you're giving a compliment to.`);
    option.setRequired(true);
    return option;
}

export function reason(option: SlashCommandStringOption)
{
    option.setName('reason');
    option.setDescription(`Why you're giving a compliment to this person.`);
    return option;
}

export function type(option: SlashCommandStringOption)
{
    option.setName('type');
    option.setDescription(`The compliment type to use. (default: Beat)`);

    const choices = Object.values(ComplimentType).map<APIApplicationCommandOptionChoice<string>>(
        (name) => {
            return {
                name,
                value: name,
            };
        }
    );
    option.addChoices(...choices);

    return option;
}
