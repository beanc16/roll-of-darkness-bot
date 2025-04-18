import { BaseSlashCommand } from '@beanc16/discordjs-common-commands';
import { ChatInputCommandInteraction } from 'discord.js';

import * as vcOptions from './Vc/options/index.js';
import { VcSubcommand, VcSubcommandGroup } from './Vc/options/index.js';
import { VcStrategyExecutor } from './Vc/strategies/index.js';

class Vc extends BaseSlashCommand
{
    constructor()
    {
        super();

        const {
            queue,
            ...remainingVcOptions
        } = vcOptions;

        // eslint-disable-next-line no-underscore-dangle -- TODO: Update this in downstream package later
        this._slashCommandData.addSubcommandGroup(queue);

        Object.values(remainingVcOptions).forEach((option) =>
        {
            if (typeof option === 'function')
            {
                // eslint-disable-next-line no-underscore-dangle -- TODO: Update this in downstream package later
                this._slashCommandData.addSubcommand(option);
            }
        });
    }

    // eslint-disable-next-line class-methods-use-this -- Leave as non-static
    public async run(interaction: ChatInputCommandInteraction): Promise<void>
    {
        // Get parameter results
        const subcommandGroup = interaction.options.getSubcommandGroup() as VcSubcommandGroup;
        const subcommand = interaction.options.getSubcommand() as VcSubcommand;

        // Send message to show the command was received
        await interaction.deferReply({
            fetchReply: true,
            ephemeral: true,
        });

        // Add safety rail
        if (!interaction.guildId)
        {
            await interaction.editReply({
                content: 'You must be in a server to use voice chat commands.',
            });
            return;
        }

        // Run subcommand
        const response = await VcStrategyExecutor.run({
            interaction,
            subcommandGroup,
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
        return 'Run voice chat commands.';
    }
}

export default new Vc();
