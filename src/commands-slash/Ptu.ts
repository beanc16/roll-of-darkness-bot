import { BaseSlashCommand } from '@beanc16/discordjs-common-commands';
import { ApplicationCommandOptionChoiceData, AutocompleteInteraction, ChatInputCommandInteraction } from 'discord.js';

import * as options from './options/index.js';
import { PtuSubcommandGroup } from './options/subcommand-groups/index.js';
import { PtuRandomSubcommand } from './options/subcommand-groups/ptu/random.js';
import { PtuLookupSubcommand } from './options/subcommand-groups/ptu/lookup.js';
import { PtuMove } from '../models/PtuMove.js';
import { MAX_AUTOCOMPLETE_CHOICES } from '../constants/discord.js';
import { PtuAbility } from '../models/PtuAbility.js';
import { PtuTm } from '../models/PtuTm.js';
import { PtuStrategyExecutor } from './strategies/ptu/index.js';
import { PtuNature } from '../models/PtuNature.js';
import { PtuPokemon } from '../types/pokemon.js';

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
            .addSubcommandGroup(options.subcommandGroups.calculate)
            .addSubcommandGroup(options.subcommandGroups.lookup)
            .addSubcommand(options.subcommandGroups.quickReference)
            .addSubcommandGroup(options.subcommandGroups.random)
            .addSubcommandGroup(options.subcommandGroups.roll);
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
        const focusedValue = interaction.options.getFocused(true);

        let choices: ApplicationCommandOptionChoiceData<string>[] = [];

        // TODO: Dry this out with strategy pattern later. Make it part of PtuStrategyExecutor.

        // Move Name
        if (focusedValue.name === 'move_name')
        {
            const moves = await PtuStrategyExecutor.getLookupData<PtuMove>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Move,
                options: { sortBy: 'name' },
            });
            choices = moves.map<ApplicationCommandOptionChoiceData<string>>(({ name }) => {
                return {
                    name,
                    value: name,
                };
            });
        }

        // Ability Name
        if (focusedValue.name === 'ability_name')
        {
            const abilities = await PtuStrategyExecutor.getLookupData<PtuAbility>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Ability,
            });
            choices = abilities.map<ApplicationCommandOptionChoiceData<string>>(({ name }) => {
                return {
                    name,
                    value: name,
                };
            });
        }

        // Natures
        if (focusedValue.name === 'nature_name')
        {
            const natures = await PtuStrategyExecutor.getLookupData<PtuNature>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Nature,
            });
            choices = natures.map<ApplicationCommandOptionChoiceData<string>>(({ name }) => {
                return {
                    name,
                    value: name,
                };
            });
        }

        // Pokemon
        if (focusedValue.name === 'pokemon_name')
        {
            if (this.isQueryingPokemonAutocomplete)
            {
                await this.waitForCurrentPokemonAutocompleteQuery();
            }

            this.isQueryingPokemonAutocomplete = true;
            const pokemon = await PtuStrategyExecutor.getLookupData<PtuPokemon>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Pokemon,
                options: {
                    name: focusedValue.value,
                },
            });
            choices = pokemon.map<ApplicationCommandOptionChoiceData<string>>(({ name }) => {
                return {
                    name,
                    value: name,
                };
            });
            this.isQueryingPokemonAutocomplete = false;
        }

        // TM Name
        if (focusedValue.name === 'tm_name')
        {
            const tms = await PtuStrategyExecutor.getLookupData<PtuTm>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Tm,
            });
            choices = tms.map<ApplicationCommandOptionChoiceData<string>>(({ name }) => {
                return {
                    name,
                    value: name,
                };
            });
        }

        // Get the choices matching the search
		const filteredChoices = choices.filter((choice) =>
            choice.name.toLowerCase().startsWith(focusedValue.value.toLowerCase(), 0)
        );

        // Discord limits a maximum of 25 choices to display
        const limitedChoices = filteredChoices.slice(0, MAX_AUTOCOMPLETE_CHOICES);

		await interaction.respond(limitedChoices);
    }

    get description()
    {
        return `Run PTU commands.`;
    }

    // TODO: Remove this later when migrated to ptu microservice
    private isQueryingPokemonAutocomplete = false;
    private async waitForCurrentPokemonAutocompleteQuery()
    {
        return new Promise<void>((resolve) =>
        {
            // Infinitely wait for this.isQueryingPokemonAutocomplete to become false
            setTimeout(async () => {
                if (this.isQueryingPokemonAutocomplete)
                {
                    await this.waitForCurrentPokemonAutocompleteQuery();
                }

                resolve();
            }, 500);
        });
    }
}

export default new Ptu();
