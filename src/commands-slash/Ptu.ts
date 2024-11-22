import { BaseSlashCommand } from '@beanc16/discordjs-common-commands';
import { logger } from '@beanc16/logger';
import { AutocompleteInteraction, ChatInputCommandInteraction } from 'discord.js';

import { PtuStrategyExecutor } from './Ptu/strategies/index.js';
import {
    PtuSubcommandGroup,
    calculate,
    lookup,
    quickReference,
    random,
    roll,
    train,
} from './Ptu/subcommand-groups/index.js';
import { PtuRandomSubcommand } from './Ptu/subcommand-groups/random.js';
import { PtuLookupSubcommand } from './Ptu/subcommand-groups/lookup.js';

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

class Ptu extends BaseSlashCommand
{
    constructor()
    {
        super();
        this._slashCommandData
            .addSubcommandGroup(calculate)
            .addSubcommandGroup(lookup)
            .addSubcommand(quickReference)
            .addSubcommandGroup(random)
            .addSubcommandGroup(roll)
            .addSubcommand(train);
    }

    async run(interaction: ChatInputCommandInteraction)
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

    async autocomplete(interaction: AutocompleteInteraction)
    {
        const startTime = Date.now();
        const focusedValue = interaction.options.getFocused(true);

        const choices = await PtuStrategyExecutor.getAutocompleteChoices(focusedValue);

        // More than 3 seconds has passed, so we can't respond to the interaction
        if (Date.now() - startTime >= 3000)
        {
            logger.warn('More than 3 seconds has passed to autocomplete in /ptu with the following data:', {
                lookupOn: focusedValue.name,
                searchValue: focusedValue.value,
                results: choices,
            });
            return;
        }

        await interaction.respond(choices);
    }

    get description()
    {
        return `Run PTU commands.`;
    }
}

export default new Ptu();
