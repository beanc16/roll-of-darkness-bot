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
        // eslint-disable-next-line no-underscore-dangle -- TODO: Update this in downstream package later
        this._slashCommandData
            .addSubcommand(roll)
            .addSubcommand(initiative)
            .addSubcommand(chance)
            .addSubcommand(luck);
    }

    // eslint-disable-next-line class-methods-use-this -- Leave as non-static
    public async run(interaction: ChatInputCommandInteraction): Promise<void>
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

    // eslint-disable-next-line class-methods-use-this -- Leave as non-static
    get description(): string
    {
        return `Run nWOD commands.`;
    }
}

export default new Nwod();
