import { BaseSlashCommand } from '@beanc16/discordjs-common-commands';
import {
    ApplicationCommandOptionChoiceData,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
} from 'discord.js';

import { MAX_AUTOCOMPLETE_CHOICES } from '../constants/discord.js';

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

import { PtuAbility } from './Ptu/models/PtuAbility.js';
import { PtuCapability } from './Ptu/models/PtuCapability.js';
import { PtuMove } from './Ptu/models/PtuMove.js';
import { PtuNature } from './Ptu/models/PtuNature.js';
import { PtuPokemon } from './Ptu/types/pokemon.js';
import { PtuTm } from './Ptu/models/PtuTm.js';

import { PtuStrategyExecutor } from './Ptu/strategies/index.js';
import { PtuStatus } from './Ptu/models/PtuStatus.js';
import { Timer } from '../services/Timer.js';
import { PtuEdge } from './Ptu/models/PtuEdge.js';
import { PtuFeature } from './Ptu/models/PtuFeature.js';

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
                await Timer.waitUntilTrue({
                    seconds: 0.2,
                    callback: () => !this.isQueryingPokemonAutocomplete,
                });
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

        // Status Name
        if (focusedValue.name === 'status_name')
        {
            const statuses = await PtuStrategyExecutor.getLookupData<PtuStatus>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Status,
            });
            choices = statuses.map<ApplicationCommandOptionChoiceData<string>>(({ name }) => {
                return {
                    name,
                    value: name,
                };
            });
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

        // Capability Name
        if (focusedValue.name === 'capability_name')
        {
            const capabilities = await PtuStrategyExecutor.getLookupData<PtuCapability>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Capability,
            });
            choices = capabilities.map<ApplicationCommandOptionChoiceData<string>>(({ name }) => {
                return {
                    name,
                    value: name,
                };
            });
        }

        // Feature Name
        if (focusedValue.name === 'feature_name')
        {
            const features = await PtuStrategyExecutor.getLookupData<PtuFeature>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Feature,
            });
            choices = features.map<ApplicationCommandOptionChoiceData<string>>(({ name }) => {
                return {
                    name,
                    value: name,
                };
            });
        }

        // Edge Name
        if (focusedValue.name === 'edge_name')
        {
            const edges = await PtuStrategyExecutor.getLookupData<PtuEdge>({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: PtuLookupSubcommand.Edge,
            });
            choices = edges.map<ApplicationCommandOptionChoiceData<string>>(({ name }) => {
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
}

export default new Ptu();
