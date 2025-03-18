import { BaseSlashCommand } from '@beanc16/discordjs-common-commands';
import { ChatInputCommandInteraction } from 'discord.js';

import { AiGenerateSubcommand } from '../Ai/options/generate.js';
import { AiSubcommandGroup, generate } from '../Ai/options/index.js';
import { AiStrategyExecutor } from '../Ai/strategies/index.js';

class Ai extends BaseSlashCommand
{
    constructor()
    {
        super();
        // eslint-disable-next-line no-underscore-dangle -- TODO: Update this in downstream package later
        this._slashCommandData
            .addSubcommandGroup(generate);
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
        const subcommand = interaction.options.getSubcommand(true) as AiGenerateSubcommand;

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
        return `Run commands that use AI to generate content.`;
    }
}

export default new Ai();
