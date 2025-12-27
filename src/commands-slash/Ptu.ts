import { BaseSlashCommand } from '@beanc16/discordjs-common-commands';
import { logger } from '@beanc16/logger';
import {
    AutocompleteInteraction,
    ButtonInteraction,
    ChatInputCommandInteraction,
    Message,
    StringSelectMenuInteraction,
} from 'discord.js';

import { PtuFakemonSubcommand } from './Ptu/options/fakemon.js';
import {
    calculate,
    PtuSubcommandGroup,
    random,
    roll,
} from './Ptu/options/index.js';
import { PtuLookupSubcommand } from './Ptu/options/lookup.js';
import { PtuRandomSubcommand } from './Ptu/options/random.js';
import { PtuStrategyExecutor } from './Ptu/strategies/index.js';

export class Ptu extends BaseSlashCommand
{
    constructor(initializeSlashCommandData = true)
    {
        super();
        if (initializeSlashCommandData)
        {
            // eslint-disable-next-line no-underscore-dangle -- TODO: Update this in downstream package later
            this._slashCommandData
                .addSubcommandGroup(calculate)
                .addSubcommandGroup(random)
                .addSubcommandGroup(roll);
        }
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

        const choices = await PtuStrategyExecutor.getAutocompleteChoices(focusedValue, interaction.user.id);

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
    public async runStringSelect(
        interaction: StringSelectMenuInteraction,
        {
            commandName,
            subcommandGroup,
            subcommand,
            message,
        }: {
            commandName: string;
            subcommandGroup: PtuSubcommandGroup;
            subcommand: PtuFakemonSubcommand;
            message: Message;
        },
    ): Promise<void>
    {
        // Run subcommand
        const response = await PtuStrategyExecutor.runStringSelect({
            interaction,
            message,
            commandName,
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
    public async runButton(
        interaction: ButtonInteraction,
        {
            commandName,
            subcommandGroup,
            subcommand,
            message,
        }: {
            message: Message;
            commandName: string;
            subcommandGroup: PtuSubcommandGroup;
            subcommand: PtuFakemonSubcommand;
        },
    ): Promise<void>
    {
        // Run subcommand
        const response = await PtuStrategyExecutor.runButton({
            interaction,
            message,
            commandName,
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
        return `Run Pokemon Tabletop United commands.`;
    }
}

export default new Ptu();
