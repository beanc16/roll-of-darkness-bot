import { BaseSlashCommand } from '@beanc16/discordjs-common-commands';
import { ChatInputCommandInteraction } from 'discord.js';

import { AiDevGenerateSubcommand } from '../Ai/options/generate_dev.js';
import { AiSubcommandGroup, generateDev } from '../Ai/options/index.js';
import { AiStrategyExecutor } from '../Ai/strategies/index.js';

class Ai_Dev extends BaseSlashCommand
{
    constructor()
    {
        super();
        // eslint-disable-next-line no-underscore-dangle -- TODO: Update this in downstream package later
        this._slashCommandData
            .addSubcommandGroup(generateDev);
    }

    // eslint-disable-next-line class-methods-use-this -- Leave as non-static
    public async run(interaction: ChatInputCommandInteraction): Promise<void>
    {
        // Send message to show the command was received
        await interaction.deferReply({
            fetchReply: true,
        });

        // Get parameter results
        const subcommandGroup = interaction.options.getSubcommandGroup() as AiSubcommandGroup;
        const subcommand = interaction.options.getSubcommand(true) as AiDevGenerateSubcommand;

        // Run subcommand
        const response = await AiStrategyExecutor.run({
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
        return `Run in-development commands that use AI to generate content.`;
    }
}

export default new Ai_Dev();
