import { BaseSlashCommand } from '@beanc16/discordjs-common-commands';
import { logger } from '@beanc16/logger';
import { AutocompleteInteraction, ChatInputCommandInteraction } from 'discord.js';

import { PtuStrategyExecutor } from './Ptu/strategies/index.js';
import {
    lookup,
    PtuSubcommandGroup,
    quickReference,
} from './Ptu/subcommand-groups/index.js';
import { PtuLookupSubcommand } from './Ptu/subcommand-groups/lookup.js';
import { PtuRandomSubcommand } from './Ptu/subcommand-groups/random.js';

export interface RandomResult
{
    name: string;
    cost?: string;
    description: string;
    numOfTimesRolled?: number;
}

export interface RandomPokeball extends RandomResult
{
    mod?: string;
    type?: string;
    jailBreakerInfo?: RandomPokeball;
}

class Ptu_Ref extends BaseSlashCommand
{
    constructor()
    {
        super();
        // eslint-disable-next-line no-underscore-dangle -- TODO: Update this in downstream package later
        this._slashCommandData
            .addSubcommandGroup(lookup)
            .addSubcommand(quickReference);
    }

    // eslint-disable-next-line class-methods-use-this -- Leave as non-static
    public async run(interaction: ChatInputCommandInteraction): Promise<void>
    {
        // Send message to show the command was received
        await interaction.deferReply({
            fetchReply: true,
        });

        // Get parameter results
        const subcommandGroup = interaction.options.getSubcommandGroup() as PtuSubcommandGroup;
        const subcommand = interaction.options.getSubcommand(true) as PtuLookupSubcommand | PtuRandomSubcommand;

        // Run subcommand
        const response = await PtuStrategyExecutor.run({
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

        const choices = await PtuStrategyExecutor.getAutocompleteChoices(focusedValue);

        // More than 3 seconds has passed, so we can't respond to the interaction
        if (Date.now() - startTime >= 3000)
        {
            logger.warn('More than 3 seconds has passed to autocomplete in /ptu_ref with the following data:', {
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
        return `Run commands to reference mechanics for Pokemon Tabletop United.`;
    }
}

export default new Ptu_Ref();
