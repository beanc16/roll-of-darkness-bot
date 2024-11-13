import { BaseSlashCommand } from '@beanc16/discordjs-common-commands';
import { ChatInputCommandInteraction } from 'discord.js';

import {
    chance,
    initiative,
    luck,
    NwodSubcommand,
    roll,
} from './Nwod/options/index.js';
import { NwodStrategyExecutor } from './Nwod/strategies/index.js';

class Nwod extends BaseSlashCommand
{
    constructor()
    {
        super();
        this._slashCommandData
            .addSubcommand(roll)
            .addSubcommand(initiative)
            .addSubcommand(chance)
            .addSubcommand(luck);
    }

    async run(interaction: ChatInputCommandInteraction)
    {
        // Get parameter results
        const isSecret = interaction.options.getBoolean('secret') ?? false;
        const subcommand = interaction.options.getSubcommand(true) as NwodSubcommand;

        // Send message to show the command was received
        await interaction.deferReply({
            ephemeral: isSecret,
            fetchReply: true,
        });

        // Run subcommand
        const response = await NwodStrategyExecutor.run({
            interaction,
            subcommand,
        });

        // Send response if the handler failed or was undefined
        if (!response)
        {
            await interaction.editReply('Subcommand Group or subcommand not yet implemented');
        }
    }

    get description()
    {
        return `Run nWOD commands.`;
    }
}

export default new Nwod();
