import { BaseSlashCommand } from '@beanc16/discordjs-common-commands';
import { logger } from '@beanc16/logger';
import { AutocompleteInteraction, ChatInputCommandInteraction } from 'discord.js';

import {
    breed,
    calculate,
    PtuSubcommandGroup,
    random,
    roll,
    train,
    typeEffectiveness,
} from './Ptu/options/index.js';
import { PtuLookupSubcommand } from './Ptu/options/lookup.js';
import { PtuRandomSubcommand } from './Ptu/options/random.js';
import { PtuStrategyExecutor } from './Ptu/strategies/index.js';

class Ptu extends BaseSlashCommand
{
    constructor()
    {
        super();
        // eslint-disable-next-line no-underscore-dangle -- TODO: Update this in downstream package later
        this._slashCommandData
            .addSubcommand(breed)
            .addSubcommandGroup(calculate)
            .addSubcommandGroup(random)
            .addSubcommandGroup(roll)
            .addSubcommand(train)
            .addSubcommand(typeEffectiveness);
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
            logger.warn('More than 3 seconds has passed to autocomplete in /ptu with the following data:', {
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
        return `Run Pokemon Tabletop United commands.`;
    }
}

export default new Ptu();
