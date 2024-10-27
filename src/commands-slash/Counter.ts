import { ChatInputCommandInteraction } from 'discord.js';

import { BaseSlashCommand } from '@beanc16/discordjs-common-commands';
import { Text } from '@beanc16/discordjs-helpers';
import {
    name,
    type,
} from './options/counter.js';

class Counter extends BaseSlashCommand
{
    private count: number;

    constructor()
    {
        super();
        this._slashCommandData
            .addStringOption(name)
            .addStringOption(type);

        this.count = 0;
    }

    async run(interaction: ChatInputCommandInteraction)
    {
        // Send message to show the command was received
        await interaction.deferReply({
            fetchReply: true,
        });

        // Get parameter results
        const name = interaction.options.getString('name', true);
        // const type = interaction.options.getString('type') ?? CounterType.Temporary;

        // Send message
        await interaction.editReply(
            this.getMessage(name)
        );
    }

    get description()
    {
        return `Add a basic counter for adding/subtracting numbers.`;
    }

    private getMessage(name: string)
    {
        return `${Text.bold(`${name}:`)} ${this.count}`;
    }
}



export default new Counter();
