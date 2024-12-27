import { BaseSlashCommand } from '@beanc16/discordjs-common-commands';
import { logger } from '@beanc16/logger';
import { AutocompleteInteraction, ChatInputCommandInteraction } from 'discord.js';

import { AdminSubcommand, refreshCache } from './Admin/options/index.js';
import { AdminStrategyExecutor } from './Admin/strategies/index.js';
import { RefreshCacheStrategy } from './Admin/strategies/RefreshCacheStrategy.js';

class Admin extends BaseSlashCommand
{
    constructor()
    {
        super();
        // eslint-disable-next-line no-underscore-dangle -- TODO: Update this in downstream package later
        this._slashCommandData
            .addSubcommand(refreshCache);
    }

    // eslint-disable-next-line class-methods-use-this -- Leave as non-static
    public async run(interaction: ChatInputCommandInteraction): Promise<void>
    {
        // Get parameter results
        const subcommand = interaction.options.getSubcommand() as AdminSubcommand;

        // Send message to show the command was received
        await interaction.deferReply({
            fetchReply: true,
        });

        // Run subcommand
        const response = await AdminStrategyExecutor.run({
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
    public async autocomplete(interaction: AutocompleteInteraction): Promise<void>
    {
        const startTime = Date.now();
        const focusedValue = interaction.options.getFocused(true);

        const choices = RefreshCacheStrategy.getAutocompleteChoices(focusedValue);

        // More than 3 seconds has passed, so we can't respond to the interaction
        if (Date.now() - startTime >= 3000)
        {
            logger.warn('More than 3 seconds has passed to autocomplete in /nwod with the following data:', {
                lookupOn: focusedValue.name,
                searchValue: focusedValue.value,
                results: choices,
            });
            return;
        }

        await interaction.respond(choices);
    }

    // eslint-disable-next-line class-methods-use-this -- Leave as non-static
    get description(): string
    {
        return 'Run admin commands.';
    }
}

export default new Admin();
