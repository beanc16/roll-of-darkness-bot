import { logger } from '@beanc16/logger';
import {
    ApplicationCommandOptionChoiceData,
    AutocompleteFocusedOption,
    ChatInputCommandInteraction,
} from 'discord.js';

import { MAX_AUTOCOMPLETE_CHOICES } from '../../../constants/discord.js';
import { BaseStrategyExecutor } from '../../strategies/BaseStrategyExecutor/BaseStrategyExecutor.js';
import { StrategyMap } from '../../strategies/types/ChatIteractionStrategy.js';
import { VcSubcommand } from '../options/index.js';
import { AutocompleteRegistry } from '../services/AutocompleteRegistry.js';
import { VcAutocompleteParameterName } from '../types.js';
import { VcConnectStrategy } from './VcConnectStrategy.js';
import { VcDeleteFileStrategy } from './VcDeleteFileStrategy.js';
import { VcDisconnectStrategy } from './VcDisconnectStrategy.js';
import { VcLoadStrategy } from './VcLoadStrategy.js';
import { VcPauseStrategy } from './VcPauseStrategy.js';
import { VcPlayStrategy } from './VcPlayStrategy.js';
import { VcRenameFileStrategy } from './VcRenameFileStrategy.js';
import { VcStopStrategy } from './VcStopStrategy.js';
import { VcUnpauseStrategy } from './VcUnpauseStrategy.js';
import { VcUploadFileStrategy } from './VcUploadFileStrategy.js';
import { VcViewFilesStrategy } from './VcViewFilesStrategy.js';

interface VcStrategyExecutorRunParameters
{
    subcommand: VcSubcommand;
    interaction: ChatInputCommandInteraction;
};

type VcStrategyMap = StrategyMap<
    string, // This is actually never used, but using never breaks the type
    VcSubcommand
>;

export class VcStrategyExecutor extends BaseStrategyExecutor
{
    private static autoCompleteRegistry = new AutocompleteRegistry();
    private static strategies: VcStrategyMap = [
        VcConnectStrategy,
        VcDeleteFileStrategy,
        VcDisconnectStrategy,
        VcLoadStrategy,
        VcPauseStrategy,
        VcPlayStrategy,
        VcRenameFileStrategy,
        VcStopStrategy,
        VcUnpauseStrategy,
        VcUploadFileStrategy,
        VcViewFilesStrategy,
    ].reduce<VcStrategyMap>((acc, cur) =>
    {
        acc[cur.key] = cur;
        return acc;
    }, {});

    public static async run({ subcommand, interaction }: VcStrategyExecutorRunParameters): Promise<boolean>
    {
        const Strategy = this.getStrategy({
            strategies: this.strategies,
            subcommand,
        });

        if (Strategy)
        {
            return await Strategy.run(interaction);
        }

        return false;
    }

    public static async getAutocompleteChoices(
        focusedValue: AutocompleteFocusedOption,
        userId: string,
    ): Promise<ApplicationCommandOptionChoiceData<string>[]>
    {
        const autocompleteName = focusedValue.name as VcAutocompleteParameterName;

        const data = await this.autoCompleteRegistry.executeHandler(autocompleteName, userId);

        // Handle enums not being set properly
        if (!data)
        {
            logger.error(`Failed to get autocomplete data. Ensure that all enums and handlers are set up as intended in ${this.name}`, { autocompleteName });
            return [];
        }

        // Narrow down the choices
        const choiceValues = data.reduce<string[]>((acc, { fileName }) =>
        {
            // Only get file names that include the search term
            if (fileName.toLowerCase().includes(focusedValue.value.toLowerCase()))
            {
                acc.push(fileName);
            }
            return acc;
            /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
        }, []);

        // Parse data to discord's format
        const choices = [...choiceValues].sort().map<ApplicationCommandOptionChoiceData<string>>((value) =>
        {
            return {
                name: value,
                value,
            };
        });

        // Discord limits a maximum of 25 choices to display
        return choices.slice(0, MAX_AUTOCOMPLETE_CHOICES);
    }
}
