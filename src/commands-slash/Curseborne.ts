import { BaseSlashCommand } from '@beanc16/discordjs-common-commands';
import {
    ApplicationCommandOptionChoiceData,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
} from 'discord.js';

import {
    CurseborneAllNestedSubcommands,
    CurseborneSubcommand,
    CurseborneSubcommandGroup,
    lookup,
    roll,
} from './Curseborne/subcommand-groups/index.js';
import { CursebourneStrategyExecutor } from './Curseborne/strategies/index.js';
import { CurseborneLookupSubcommand } from './Curseborne/subcommand-groups/lookup.js';
import { MAX_AUTOCOMPLETE_CHOICES } from '../constants/discord.js';
import { BaseGetLookupSearchMatchType } from './strategies/BaseLookupStrategy.js';

class Cursebourne extends BaseSlashCommand
{
    constructor()
    {
        super();
        this._slashCommandData
            .addSubcommandGroup(lookup)
            .addSubcommand(roll);
    }

    async run(interaction: ChatInputCommandInteraction)
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
        const response = await CursebourneStrategyExecutor.run({
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

        // Move Name
        if (focusedValue.name === 'trick_name')
        {
            const results = await CursebourneStrategyExecutor.getLookupData({
                subcommandGroup: CurseborneSubcommandGroup.Lookup,
                subcommand: CurseborneLookupSubcommand.Trick,
                lookupParams: {
                    ...(focusedValue.value.length > 0 ? { name: focusedValue.value } : {}),
                    options: {
                        matchType: BaseGetLookupSearchMatchType.SubstringMatch,
                    },
                },
            });
            choices = results.map<ApplicationCommandOptionChoiceData<string>>(({ name }) => {
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

    get commandName()
    {
        return 'cb';
    }

    get description()
    {
        return `Run Cursebourne commands.`;
    }
}

export default new Cursebourne();
