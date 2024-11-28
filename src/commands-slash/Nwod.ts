import { BaseSlashCommand } from '@beanc16/discordjs-common-commands';
import { logger } from '@beanc16/logger';
import { AutocompleteInteraction, ChatInputCommandInteraction } from 'discord.js';

import {
    chance,
    initiative,
    lookup,
    luck,
    NwodSubcommand,
    NwodSubcommandGroup,
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
            .addSubcommandGroup(lookup)
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
        const subcommandGroup = interaction.options.getSubcommandGroup() as NwodSubcommandGroup;
        const subcommand = interaction.options.getSubcommand() as NwodSubcommand;

        // Send message to show the command was received
        await interaction.deferReply({
            ephemeral: isSecret,
            fetchReply: true,
        });

        // Run subcommand
        const response = await NwodStrategyExecutor.run({
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
    public async autocomplete(interaction: AutocompleteInteraction): Promise<void>
    {
        const startTime = Date.now();
        const focusedValue = interaction.options.getFocused(true);

        const choices = await NwodStrategyExecutor.getAutocompleteChoices(focusedValue);

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
        return `Run nWOD commands.`;
    }
}

export default new Nwod();
