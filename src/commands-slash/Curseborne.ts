import { BaseSlashCommand } from '@beanc16/discordjs-common-commands';
import {
    ApplicationCommandOptionChoiceData,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
} from 'discord.js';

import { MAX_AUTOCOMPLETE_CHOICES } from '../constants/discord.js';
import { CurseborneStrategyExecutor } from './Curseborne/strategies/index.js';
import {
    CurseborneAllNestedSubcommands,
    CurseborneSubcommand,
    CurseborneSubcommandGroup,
    lookup,
    roll,
} from './Curseborne/subcommand-groups/index.js';
import { CurseborneLookupSubcommand } from './Curseborne/subcommand-groups/lookup.js';
import { CurseborneCompleteParameterName } from './Curseborne/types/types.js';
import { BaseGetLookupSearchMatchType } from './strategies/BaseLookupStrategy.js';

class Curseborne extends BaseSlashCommand
{
    constructor()
    {
        super();
        // eslint-disable-next-line no-underscore-dangle -- TODO: Update this in downstream package later
        this._slashCommandData
            .addSubcommandGroup(lookup)
            .addSubcommand(roll);
    }

    // eslint-disable-next-line class-methods-use-this -- Leave as non-static
    public async run(interaction: ChatInputCommandInteraction): Promise<void>
    {
        // Get parameter results
        const isSecret = interaction.options.getBoolean('secret') ?? false;
        const subcommandGroup = interaction.options.getSubcommandGroup() as CurseborneSubcommandGroup;
        const subcommand = interaction.options.getSubcommand(true) as CurseborneSubcommand | CurseborneAllNestedSubcommands;

        // Send message to show the command was received
        await interaction.deferReply({
            ephemeral: isSecret,
            fetchReply: true,
        });

        // Run subcommand
        const response = await CurseborneStrategyExecutor.run({
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
        const focusedValue = interaction.options.getFocused(true);
        const autocompleteName = focusedValue.name as CurseborneCompleteParameterName;

        let data: { name: string }[] = [];

        // Move Name
        if (autocompleteName === CurseborneCompleteParameterName.TrickName)
        {
            data = await CurseborneStrategyExecutor.getLookupData({
                subcommandGroup: CurseborneSubcommandGroup.Lookup,
                subcommand: CurseborneLookupSubcommand.Trick,
                lookupParams: {
                    ...(focusedValue.value.length > 0 ? { name: focusedValue.value } : {}),
                    options: {
                        matchType: BaseGetLookupSearchMatchType.SubstringMatch,
                    },
                },
            });
        }

        // Parse data to discord's format
        const choices = data.map<ApplicationCommandOptionChoiceData<string>>(({ name }) =>
        {
            return {
                name,
                value: name,
            };
        });

        // Get the choices matching the search
        const filteredChoices = choices.filter(choice =>
            choice.name.toLowerCase().startsWith(focusedValue.value.toLowerCase(), 0),
        );

        // Discord limits a maximum of 25 choices to display
        const limitedChoices = filteredChoices.slice(0, MAX_AUTOCOMPLETE_CHOICES);

        await interaction.respond(limitedChoices);
    }

    // eslint-disable-next-line class-methods-use-this -- Leave as non-static
    get commandName(): string
    {
        return 'cb';
    }

    // eslint-disable-next-line class-methods-use-this -- Leave as non-static
    get description(): string
    {
        return `Run Cursebourne commands.`;
    }
}

export default new Curseborne();
